+++
title = "Async Rust: Timing out CPU bound tasks"
series = ["Reliable services in Rust"]
date = "2020-04-13T20:00:00+01:00"
tags = [
  "rust",
  "async",
  "tokio",
]
categories = [
  "Site Reliability",
]
draft = true
+++

In a [previous post](efficient-rust-services-timeouts/) we talked about how to timeout IO requests. In this post we'll talk about how to timeout tasks that are not only IO bound but also involve CPU bound workloads.

## Computing stuff within async/await

Rust's async/await support is great for IO.  The typical use case is calling another service or building a server to handle network requests.  But what happens when, between responding to a request or making a network request, we want to perform some useful computations?

Microservice jokes aside, let's imagine we have a service that makes a request to an upstream server for a $start$ float, and in a loop adds $0.01$ until it reaches the requested value. 

Here's our method to count bit by bit to $n$.

```rust
fn to_n(start: f64, n: f64) -> f64 {
    let mut a = start;
    while a < n {
        a += 0.01; 
    }
    a
}
```

If we set this to a high number this could tie up a CPU for _years_. Not very useful, but it can demonstrate something for us.


## Setting timeouts for compute bound operations

First to illustrate the problem with CPU bound operations we'll use a really simple, but potentially long running function that ties up the CPU incrementing a number $n$ times.

```rust

```

Let's see what happens if we plug this function into our test driver with a massive number and set a timeout of $500ms$.
```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let fib_million = add_n(1_000_000_000_000);

    let result = tokio::time::timeout(
        std::time::Duration::from_millis(500), 
        fib_million
    ).await?;
    println!("{}", result);
    Ok(())
}
```

```rust
async fn add_n(n: u64) -> u64 {
    let mut a = 0;
    while a < n {
        a += 1; 

        if a % 1024 == 0 {
            tokio::task::yield_now().await;
        }
    }
    a
}

```
