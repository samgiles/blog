+++
title = "HackaTUM: hackaTUM_C0dev1d19"
date = "2020-04-19T19:30:00+01:00"
tags = [
  "rust",
  "machine learning",
  "kubernetes",

]
categories = [
  "Hackathon",
]
draft = false
+++

On Friday evening a friend contacted me about a [hackathon](https://covid19.hackatum.com) affiliated with _The Technical University of Munich_ with topics focusing on technology that could help with the current Covid-19 pandemic, and so I joined a team to build a backend for their idea and hacked all of Saturday!

The hackathon had a few different tracks to choose from ranging from healthcare, to government and society.  The team already had a vision for the education track to incorporate some machine learning techniques to personalise, and hopefully optimise, a student's distance learning experience.

The vision was a personalised online platform that could detect the student's attentiveness, generate personal learning metrics, and suggest appropriate content at appropriate times based on real time indicators for engagement.

## How it works in theory

The student begins by viewing content and opening their webcam. A stream of frames is then sent to a service which in turn forwards each frame concurrently to a collection of feature extraction services.  Each feature extraction service implements some kind of algorithm to determine things such as: the estimated orientation of a face, the estimated body pose, object detection, eye tracking etc. Once all features have been computed, they're run through a classifier and the output classification can be turned into events and data that can be used to guide a student's learning.

## The team

The wider team used the moniker _YouLearn_. We split into what was called the design team, an AI team, and the frontend team. I think this was mostly for administrative reasons, and team size rules. The following mostly describes what the team I was in got up to.

Our team besides me was [Ewelina](https://www.linkedin.com/in/ewelina-gromada-4a70ab119), [Jakob](https://twitter.com/jsincn), [Zhakshylyk](https://twitter.com/tbcpitw), and [Aqib](https://twitter.com/AqibAnsr).

## The prototype we built

Our small team, dubbed the "frontend team", managed to build a small working prototype consisting of a single page web app and a scalable backend incorporating one feature extraction service, a websocket server that could handle receiving a stream of frames, and a really simple "classifier" to turn the response from the feature extraction into a presence event.

{{<figure src="/images/ml-architecture-hackathon.svg" caption="Architecture diagram, the feature extractor in blue is all we had time to build... 😞 the parts in red were aspirational 😃" >}}

First off we needed some way of getting frames from the student's webcam to the feature extraction service. I wanted to use WebRTC to stream the frames to the server, but since I only had a day I quickly gave up on getting that to work reliably. Instead we had a hacky approach that would send an encoded frame down a websocket connection at a rate of approximately $5fps$.  The messaging server would then decode the frame, validate the image format and forward it to the feature extraction service.

The websocket server was written in Rust, you can see the code [here](https://github.com/hack2020team/backend-services/tree/master/messaging) but, fair warning, it's really hacky! I really liked using Rust for this because I could write incredibly hacky code fast with a lot of confidence that it would be stable and do what I expect. I'm happy to report, at the time of writing the service has been up for nearly 22h without a crash, and we even had a live demo that actually worked flawlessly! Rust really is awesome!

Since we ended up only using a single feature extractor, we probably could have used a single service to handle the extraction, the websocket connection, and the rudimentary classification. But we were ambitious and wanted to incorporate more than one feature detection method so I left room in the architecture to add this easily.  Besides, I wanted to use Rust to handle the user connection, and the feature extraction and classification stuff that our colleague had been working on was written in Python.

For ease of use, I used [gRPC for Python](https://grpc.io/docs/tutorials/basic/python/), all I needed to do was define a protobuf version of the service and I had a working client ready in Rust, and a server implementation for Python that made it really easy to wrap the code our team member [@tbcpitw](httpsI//twitter.com/tbcpitw) had iterated on locally. You can find the unwrapped code [here](https://github.com/nurlanov-zh/YouLearn-AI-team) which is based off of a few open source examples.

The protobuf for the head pose service was minimal, we send an encoded frame, and receive a response containing a vector encoding the extracted feature.

```proto
message Frame {
  uint64 frame_identifier = 1;
  bytes frame_data = 3; 
}

message PoseResponse {
  uint64 frame_identifier = 1;
  repeated float pose = 2;
}

service HeadPoseApi {
  rpc GetPose(Frame) returns (PoseResponse) {}
}
```


Each frame would be processed independent of any other frame which made implementation and horizontal scaling really easy. This would have been significantly more complex if there was a temporal requirement for feature extraction. If temporal data was required we could perhaps have sent a stream of frames to the extractor and process a short time slice at a time depending on the length of temporal data required.

Since we only had a simple implementation the only "classification" we had time for was an indication presence. The head pose estimator would return an empty vector back to the messaging service if no face was detected. In our hackday implementation we had some boring but effective logic for a demo: if we stopped detecting a face for $5$ frames then we send an event with an increasing probability value linearly trending towards $1.0$ as we reach $20$ frames without detecting a face.

When the frontend, built by [Ewelina](https://www.linkedin.com/in/ewelina-gromada-4a70ab119), [@jsincn](https://twitter.com/jsincn), and [@AqibAnsr](https://twitter.com/AqibAnsr), receives a message, it would then prompt the student to try and re-engage them. Check out this tiny demo I made of me not paying attention and an alert popping up. Black Mirror fans may be thinking about the [_Fifteen Million Merits_](https://en.wikipedia.org/wiki/Fifteen_Million_Merits) episode, but that aside... I think it's a pretty cool tech demo!

{{< video src="/images/hackatum-demo.webm" >}}

You can check out the pitch that included a [live demo on YouTube](https://www.youtube.com/watch?v=wHf8OxEpl3A)!

## Tools and libraries we used

The frontend was written as a React single page web app - while I have strong feelings about the React ecosystem because I think it makes it very easy to build consumer facing apps that are really heavy on the mobile web and therefore frustrating or inaccessible to a large proportion of the web's users... For a hackday, precisely because it is a productive framework that makes things easier, we managed to get a really cool looking app running very quickly. You can find [the code on GitHub here](https://github.com/hack2020team/pe-fe).

The messaging service was written in Rust using the [`async_tungstenite` crate](https://docs.rs/async-tungstenite/) for websockets, and the [`tonic` crate](https://github.com/hyperium/tonic) for gRPC. The code can be found [on GitHub here](https://github.com/hack2020team/backend-services).

The head pose feature extraction was an adapted open sourced example by [Yin Guobing](https://github.com/yinguobing) which uses [Tensorflow](https://www.tensorflow.org/) and [OpenCV](https://opencv.org/). The gRPC service can be found [here](https://github.com/hack2020team/headpose-service/blob/5499f1b0361bc17d3fbec022aa579b4df6d17c6c/hack2020team/hptracker/main.py#L12), and the work by [@tbcpitw](https://twitter.com/tbcpitw) including the classifier and combining other feature extraction methods that we didn't get around to implementing as a service can be found [here](https://github.com/nurlanov-zh/YouLearn-AI-team).

We deployed the backend services in Docker containers onto a Kubernetes cluster using [fluxcd](https://fluxcd.io) for continuous deployment.  Deployment configuration can be found [here](https://github.com/hack2020team/backend-config). Using [`kustomize`](https://kustomize.io/), a [`kind`](https://kind.sigs.k8s.io/) kubernetes cluster, and a setup for your own ingress controller, you should be able to apply that repository and have a working local version - however your mileage may vary. While we were working on this everything was deployed to my personal Kubernetes cluster, the one this very site is running on!

#### Tools that get a special mention:

At Skyscanner we had a great tool that could manage protobuf dependencies, and I was thinking I might try and recreate an open sourced version, but luckily it already is open sourced, and a bonus, it's written in Rust! If you're in protobuf dependency hell I seriously recommend [protovend](https://github.com/keirlawson/protovend), it makes working with, and versioning protobuf definitions much easier.

I wanted to experiment with using [linkerd](https://linkerd.io) as a service mesh with some "real world-ish" traffic, particularly for gRPC load balancing. I was really pleased with how easy it was to get it working and the added debugability it provided.

