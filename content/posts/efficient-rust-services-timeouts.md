+++
title = "Rust services: Timing out IO bound tasks"
series = ["Reliable services in Rust"]
date = "2020-04-17T00:00:00+01:00"
tags = [
  "rust",
  "async",
  "tokio",
]
categories = [
  "Site Reliability",
]
draft = false
+++

Handling a networked request for your amazing application or website costs money and time. Who wants to waste time and money?

Every single networked request should have a timeout. No excuses. By setting a timeout you constrain the amount of time your poor user has to stare blankly at your broken service when something goes wrong - and trust me it will go wrong eventually. Even if your service is flawless, the network, hardware, and reality will eventually come between you and your user.


## Settings timeouts for IO operations

We'll use the [tokio runtime](https://tokio.rs/) in the examples, it's quite likely you'd also use tokio for your projects as it's the foundation for the majority of asynchronous IO programming within the Rust ecosystem. For a general async/await primer I recommend the [async book](https://rust-lang.github.io/async-book/).

### Arbitrary IO with tokio

In the first example we'll demonstrate the [`tokio::time::timeout`](https://docs.rs/tokio/0.2.18/tokio/time/fn.timeout.html) function.  The timeout function can be used to require a future to complete within a certain amount of time. If the supplied future hasn't completed before the timeout then an error is returned and the program continues.

In this example there is a future named `long_running_task` which resolves successfully after $1000ms$. However we run it with a timeout constraint of $500ms$ which means that when we `await` the result it will return an [`Elapsed`](https://docs.rs/tokio/0.2.18/tokio/time/struct.Elapsed.html) error.

```rust
// Use the tokio runtime to drive async/await
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Simulate a long running IO task using a future that completes after 1000ms
    let long_running_task = tokio::time::delay_for(Duration::from_millis(1000));

    // Create a `Timeout` future that fails with an `tokio::time::Elapsed` error after 500ms
    tokio::time::timeout(
        std::time::Duration::from_millis(500), 
        long_running_task
    ).await?;
    Ok(())
}
```
```sh
> Error: Elapsed(())
```

### Timeouts with the reqwest HTTP library

Some libraries such as the awesome [reqwest](https://docs.rs/crate/reqwest/) library make it easy to set a timeout when building the IO request.

```rust
#[tokio::main]
async fn main() -> Request<(), Box<dyn std::error::Error>> {
  let client = reqwest::Client::new();

  // Make a request that will block for 2000ms
  let response = client.get("https://httpstat.us/200?sleep=2000")
      // Set a timeout of 500 milliseconds
      .timeout(std::time::Duration::from_millis(500))
      .send()
      // Await the request future
      .await()?;
}

```
```sh
> Error: reqwest::Error { kind: Request, url: "https://httpstat.us/200?sleep=2000", source: TimedOut }
```

It's worth checking the documentation of your favourite high level IO client in case there is a built in method for timeout settings before resorting to the `tokio::time::timeout` future. In some cases the library will allow you to control timeouts of specific aspects of the IO.  The [`reqwest::ClientBuilder`](https://docs.rs/reqwest/0.10.4/reqwest/struct.ClientBuilder.html) for example allows you to configure a [`connect_timeout`](https://docs.rs/reqwest/0.10.4/reqwest/struct.ClientBuilder.html#method.connect_timeout) which applies to the TCP connect phase of a client, and a more general [`timeout`](https://docs.rs/reqwest/0.10.4/reqwest/struct.ClientBuilder.html#method.timeout) which applies to the entire HTTP request/response.
