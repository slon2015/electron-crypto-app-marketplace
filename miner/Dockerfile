FROM ubuntu:20.04

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y git build-essential cmake libuv1-dev libssl-dev libhwloc-dev

WORKDIR /apps

RUN git clone https://github.com/xmrig/xmrig.git

WORKDIR /apps/xmrig/build

RUN cmake ..
RUN make -j$(nproc)
ENTRYPOINT [ "/apps/xmrig/build/xmrig" ]
