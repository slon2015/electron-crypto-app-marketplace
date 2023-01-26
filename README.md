# Crypto-Marketplace App

It's a proof of concept of electron-based application that provide miner marketplace functionality.
This app can install monero miner in docker with user consent. Instaled miner state stored in json file in **~/defi-os/apps-registry.json**

## Installation process:

- Provide your monero wallet address to text field
- Click "Install Miner"
- Look your miner in docker with provided container id or by name **defi-os-miner**

## Miner configuration

Your miner configured by default to mine with **xmrpool.eu** mining pool

## Miner execution

Electron process polls a device idle status. If the device in idle after **5 minutes** the poller starts a miner container. After idle interuption the poller disables the container

# Tasks for develop

- [x] Miner installation in docker
- [ ] Validate miner against antivirus detection
- [ ] Develop usable UI
- [ ] Move idle status poller to utility process
- [ ] Config optimisation for miner
- [ ] Config optimisation for docker container
- [ ] Move constants to configuration (apps file, miner pool, idle interval, miner container name)
