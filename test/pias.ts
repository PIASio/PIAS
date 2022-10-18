/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-useless-concat */

import { expect } from 'chai'
import type { SnapshotRestorer } from '@nomicfoundation/hardhat-network-helpers'
import { takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import type { Signer } from 'ethers'
import type { Pias, TestInterfaceId } from '../typechain-types'
import { ethers, upgrades } from 'hardhat'

describe('Pias', () => {
	let deployer: Signer
	let user: Signer
	let pias: Pias
	let piasUser: Pias
	let interfaceId: TestInterfaceId
	let snapshot: SnapshotRestorer
	before(async () => {
		;[deployer, user] = await ethers.getSigners()
		const factory = await ethers.getContractFactory('Pias')
		pias = (await factory.deploy()) as Pias
		await pias.deployed()
		await pias.initialize()
		piasUser = pias.connect(user)
		const interfaceIdFactory = await ethers.getContractFactory(
			'TestInterfaceId'
		)
		interfaceId = (await interfaceIdFactory.deploy()) as TestInterfaceId
		await interfaceId.deployed()
	})
	before(async () => {
		snapshot = await takeSnapshot()
	})
	afterEach(async () => {
		await snapshot.restore()
	})

	describe('supportsInterface', () => {
		describe('success', () => {
			it('IPias', async () => {
				const id = await interfaceId.getIPiasId()
				const result = await pias.supportsInterface(id)
				expect(result).to.be.true
			})
			it('IAccessControlEnumerableUpgradeable', async () => {
				const id = await interfaceId.getIAccessControlEnumerableUpgradeableId()
				const result = await pias.supportsInterface(id)
				expect(result).to.be.true
			})
			it('IERC20MetadataUpgradeable', async () => {
				const id = await interfaceId.getIERC20MetadataUpgradeableId()
				const result = await pias.supportsInterface(id)
				expect(result).to.be.true
			})
			it('IERC20Upgradeable', async () => {
				const id = await interfaceId.getIERC20UpgradeableId()
				const result = await pias.supportsInterface(id)
				expect(result).to.be.true
			})
		})
		describe('fail', () => {
			it('unsupported interface', async () => {
				const result = await pias.supportsInterface('0x11223344')
				expect(result).to.be.false
			})
		})
	})

	describe('name', () => {
		it('name is PIAS', async () => {
			const tmp = await pias.name()
			expect(tmp).to.equal('PIAS')
		})
	})

	describe('symbol', () => {
		it('symbol is PIAS', async () => {
			const tmp = await pias.symbol()
			expect(tmp).to.equal('PIAS')
		})
	})

	describe('initialize', () => {
		describe('fail', () => {
			it('Cannot be executed more than once', async () => {
				await expect(pias.initialize()).to.be.revertedWith(
					'Initializable: contract is already initialized'
				)
			})
		})
	})

	describe('default role', () => {
		describe('deployer', () => {
			it('has admin role', async () => {
				const adminRole = await pias.DEFAULT_ADMIN_ROLE()
				const result = await pias.hasRole(
					adminRole,
					await deployer.getAddress()
				)
				expect(result).to.equal(true)
			})
			it('has burner role', async () => {
				const burnRole = await pias.BURNER_ROLE()
				const result = await pias.hasRole(burnRole, await deployer.getAddress())
				expect(result).to.equal(true)
			})
			it('has minter role', async () => {
				const minterRole = await pias.MINTER_ROLE()
				const result = await pias.hasRole(
					minterRole,
					await deployer.getAddress()
				)
				expect(result).to.equal(true)
			})
		})
		describe('user', () => {
			it('no has admin role', async () => {
				const adminRole = await pias.DEFAULT_ADMIN_ROLE()
				const result = await pias.hasRole(adminRole, await user.getAddress())
				expect(result).to.equal(false)
			})
			it('no has burner role', async () => {
				const burnRole = await pias.BURNER_ROLE()
				const result = await pias.hasRole(burnRole, await user.getAddress())
				expect(result).to.equal(false)
			})
			it('no has minter role', async () => {
				const minterRole = await pias.MINTER_ROLE()
				const result = await pias.hasRole(minterRole, await user.getAddress())
				expect(result).to.equal(false)
			})
		})
	})

	describe('mint', () => {
		describe('success', () => {
			it('mint', async () => {
				const userAddress = await user.getAddress()
				const before = await pias.balanceOf(userAddress)
				expect(before.toString()).to.equal('0')
				await pias.mint(userAddress, 10000)
				const after = await pias.balanceOf(userAddress)
				expect(after.toString()).to.equal('10000')
			})
		})
		describe('fail', () => {
			it('no have role', async () => {
				const userAddress = await user.getAddress()
				await expect(piasUser.mint(userAddress, 10000)).to.be.reverted
			})
		})
	})

	describe('burn', () => {
		describe('success', () => {
			it('burn', async () => {
				const userAddress = await user.getAddress()
				await pias.mint(userAddress, 10000)
				const before = await pias.balanceOf(userAddress)
				expect(before.toString()).to.equal('10000')
				await pias.burn(userAddress, 10000)
				const after = await pias.balanceOf(userAddress)
				expect(after.toString()).to.equal('0')
			})
		})
		describe('fail', () => {
			it('no have role', async () => {
				const userAddress = await user.getAddress()
				await expect(piasUser.burn(userAddress, 10000)).to.be.reverted
			})
		})
	})

	describe('cap', () => {
		const CAP = '100' + '0000' + '0000' + '000000000000000000'
		describe('success', () => {
			it('get cap', async () => {
				const cap = await pias.cap()
				expect(cap.toString()).to.equal(CAP)
			})
			it('mint just a little', async () => {
				const userAddress = await user.getAddress()
				await pias.mint(userAddress, '100' + '000000000000000000')
				const balance = await pias.balanceOf(userAddress)
				expect(balance.toString()).to.equal('100' + '000000000000000000')
			})
			it('mint max value', async () => {
				const userAddress = await user.getAddress()
				await pias.mint(userAddress, CAP)
				const balance = await pias.balanceOf(userAddress)
				expect(balance.toString()).to.equal(CAP)
			})
		})
		describe('fail', () => {
			it('cannot mint over cap', async () => {
				const userAddress = await user.getAddress()
				await pias.mint(userAddress, CAP)
				await expect(pias.mint(userAddress, 1)).to.be.revertedWith(
					'ERC20Capped: cap exceeded'
				)
			})
		})
	})

	describe.skip('upgradable', () => {
		describe('success', () => {
			it('get cap', async () => {
				const piasBase = await ethers.getContractFactory('Pias')
				const piasProxy = await upgrades.deployProxy(piasBase, [])
				await piasProxy.deployed()
				const userAddress = await user.getAddress()
				await piasProxy.mint(userAddress, '100' + '000000000000000000')
				const balance = await piasProxy.balanceOf(userAddress)
				expect(balance.toString()).to.equal('100' + '000000000000000000')
				const pias2 = await ethers.getContractFactory('Pias2')
				const box = await upgrades.upgradeProxy(piasProxy.address, pias2)
				const tmp = await box.FOOBAA_ROLE()
				expect(tmp).to.equal(
					'0x465628830801e83639cd4fecfab10d011e7d855e8788059dbf35ccc73aacdb74'
				)
			})
		})
	})
})
