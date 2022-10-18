/* eslint-disable @typescript-eslint/no-non-null-assertion */

import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import '@nomicfoundation/hardhat-chai-matchers'
import * as dotenv from 'dotenv'

dotenv.config()

const privateKey =
	typeof process.env.PRIVATE_KEY === 'undefined'
		? '0000000000000000000000000000000000000000000000000000000000000000'
		: process.env.PRIVATE_KEY

const config = {
	solidity: {
		version: '0.8.16',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		bscTest: {
			url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
			accounts: [privateKey],
		},
		bscMain: {
			url: 'https://bsc-dataseed.binance.org/',
			accounts: [privateKey],
		},
	},
	etherscan: {
		apiKey: process.env.BSCSCAN_API_KEY!,
	},
}

export default config
