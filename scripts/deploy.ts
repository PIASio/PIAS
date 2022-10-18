/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers, upgrades } from 'hardhat'

async function main() {
	const tokenFactory = await ethers.getContractFactory('Pias')
	const token = await upgrades.deployProxy(tokenFactory, [], { kind: 'uups' })
	await token.deployed()
	console.log('proxy was deployed to:', token.address)
	const filter = token.filters.Upgraded()
	const events = await token.queryFilter(filter)
	console.log('logic was deployed to:', events[0].args!.implementation)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})

// Testnet
// proxy 0xC669A70e0B3D07e3514aFd97eBFb3D134077A4a1
// logic 0x8686A288ae960A8B761De788079A01F9FBC3973E
// npx hardhat run dist/scripts/deploy.js --network bscTest
// npx hardhat verify --contract contracts/Pias.sol:Pias --network bscTest 0x8686A288ae960A8B761De788079A01F9FBC3973E

// Mainnet
// proxy was deployed to: 0xC669A70e0B3D07e3514aFd97eBFb3D134077A4a1
// logic 0x8686A288ae960A8B761De788079A01F9FBC3973E
// npx hardhat run dist/scripts/deploy.js --network bscMain
// npx hardhat verify --contract contracts/Pias.sol:Pias --network bscMain 0x8686A288ae960A8B761De788079A01F9FBC3973E
