import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ethers } from 'ethers'
import { deployments, waffle } from 'hardhat'
import EthersSafe from '../src'
import { ContractNetworksConfig } from '../src/configuration/contracts'
import { SENTINEL_ADDRESS, ZERO_ADDRESS } from '../src/utils/constants'
import { getAccounts } from './utils/setupConfig'
import {
  getDailyLimitModule,
  getMultiSend,
  getSafeWithOwners,
  getSocialRecoveryModule
} from './utils/setupContracts'
chai.use(chaiAsPromised)

describe('Safe modules manager', () => {
  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const accounts = await getAccounts()
    const chainId: number = (await waffle.provider.getNetwork()).chainId
    const contractNetworks: ContractNetworksConfig = {
      [chainId]: { multiSendAddress: (await getMultiSend()).address }
    }
    return {
      dailyLimitModule: await getDailyLimitModule(),
      socialRecoveryModule: await getSocialRecoveryModule(),
      safe: await getSafeWithOwners([accounts[0].address]),
      accounts,
      contractNetworks
    }
  })

  describe('getModules', async () => {
    it('should return all the enabled modules', async () => {
      const { safe, accounts, dailyLimitModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      chai.expect((await safeSdk.getModules()).length).to.be.eq(0)
      const tx = await safeSdk.getEnableModuleTx(dailyLimitModule.address)
      const txResponse = await safeSdk.executeTransaction(tx)
      await txResponse.wait()
      chai.expect((await safeSdk.getModules()).length).to.be.eq(1)
    })
  })

  describe('isModuleEnabled', async () => {
    it('should return true if a module is enabled', async () => {
      const { safe, accounts, dailyLimitModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.false
      const tx = await safeSdk.getEnableModuleTx(dailyLimitModule.address)
      const txResponse = await safeSdk.executeTransaction(tx)
      await txResponse.wait()
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.true
    })
  })

  describe('getEnableModuleTx', async () => {
    it('should fail if address is invalid', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getEnableModuleTx('0x123')
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is equal to sentinel', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getEnableModuleTx(SENTINEL_ADDRESS)
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is equal to 0x address', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getEnableModuleTx(ZERO_ADDRESS)
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is already enabled', async () => {
      const { safe, accounts, dailyLimitModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx1 = await safeSdk.getEnableModuleTx(dailyLimitModule.address)
      const txResponse = await safeSdk.executeTransaction(tx1)
      await txResponse.wait()
      const tx2 = safeSdk.getEnableModuleTx(dailyLimitModule.address)
      await chai.expect(tx2).to.be.rejectedWith('Module provided is already enabled')
    })

    it('should enable a Safe module', async () => {
      const { safe, accounts, dailyLimitModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      chai.expect((await safeSdk.getModules()).length).to.be.eq(0)
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.false
      const tx = await safeSdk.getEnableModuleTx(dailyLimitModule.address)
      const txResponse = await safeSdk.executeTransaction(tx)
      await txResponse.wait()
      chai.expect((await safeSdk.getModules()).length).to.be.eq(1)
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.true
    })
  })

  describe('getDisableModuleTx', async () => {
    it('should fail if address is invalid', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getDisableModuleTx('0x123')
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is equal to sentinel', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getDisableModuleTx(SENTINEL_ADDRESS)
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is equal to 0x address', async () => {
      const { safe, accounts, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getDisableModuleTx(ZERO_ADDRESS)
      await chai.expect(tx).to.be.rejectedWith('Invalid module address provided')
    })

    it('should fail if address is not enabled', async () => {
      const { safe, accounts, dailyLimitModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })
      const tx = safeSdk.getDisableModuleTx(dailyLimitModule.address)
      await chai.expect(tx).to.be.rejectedWith('Module provided is not enabled already')
    })

    it('should disable Safe modules', async () => {
      const { dailyLimitModule, accounts, socialRecoveryModule, contractNetworks } = await setupTests()
      const [account1] = accounts
      const safe = await getSafeWithOwners([account1.address])
      const safeSdk = await EthersSafe.create({
        ethers,
        safeAddress: safe.address,
        providerOrSigner: account1.signer,
        contractNetworks
      })

      const tx1 = await safeSdk.getEnableModuleTx(dailyLimitModule.address)
      const txResponse1 = await safeSdk.executeTransaction(tx1)
      await txResponse1.wait()
      const tx2 = await safeSdk.getEnableModuleTx(socialRecoveryModule.address)
      const txResponse2 = await safeSdk.executeTransaction(tx2)
      await txResponse2.wait()
      chai.expect((await safeSdk.getModules()).length).to.be.eq(2)
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.true
      chai.expect(await safeSdk.isModuleEnabled(socialRecoveryModule.address)).to.be.true

      const tx3 = await safeSdk.getDisableModuleTx(dailyLimitModule.address)
      const txResponse3 = await safeSdk.executeTransaction(tx3)
      await txResponse3.wait()
      chai.expect((await safeSdk.getModules()).length).to.be.eq(1)
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.false
      chai.expect(await safeSdk.isModuleEnabled(socialRecoveryModule.address)).to.be.true

      const tx4 = await safeSdk.getDisableModuleTx(socialRecoveryModule.address)
      const txResponse4 = await safeSdk.executeTransaction(tx4)
      await txResponse4.wait()
      chai.expect((await safeSdk.getModules()).length).to.be.eq(0)
      chai.expect(await safeSdk.isModuleEnabled(dailyLimitModule.address)).to.be.false
      chai.expect(await safeSdk.isModuleEnabled(socialRecoveryModule.address)).to.be.false
    })
  })
})
