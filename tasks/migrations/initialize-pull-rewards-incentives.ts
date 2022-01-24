import { isAddress } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { getFirstSigner } from '../../helpers/contracts-helpers';
import { DRE } from '../../helpers/misc-utils';
import { waitForTx } from '../../helpers/misc-utils';

task(
  `initialize-pull-rewards-incentives`,
  `Initializes the PullRewardsIncentivesController contract`
)
  .addParam('incentiveController')
  .addParam('incentiveProxy')
  .addParam('rewardsVault')
  .addParam('proxyAdmin', `The address to be added as an Admin role at the Transparent Proxy.`)
  .setAction(
    async ({ incentiveController, incentiveProxy, rewardsVault, proxyAdmin }, localBRE) => {
      await localBRE.run('set-DRE');

      if (!isAddress(incentiveController)) {
        throw Error('Missing or incorrect incentiveController param');
      }
      if (!isAddress(incentiveProxy)) {
        throw Error('Missing or incorrect incentiveProxy param');
      }
      if (!isAddress(rewardsVault)) {
        throw Error('Missing or incorrect rewardsVault param');
      }
      if (!isAddress(proxyAdmin)) {
        throw Error('Missing or incorrect proxyAdmin param');
      }

      console.log(`[PullRewardsIncentivesController] Starting initialize:`);

      const incentivesControllerImpl = await DRE.ethers.getContractAt(
        'PullRewardsIncentivesController',
        incentiveController,
        await getFirstSigner()
      );

      const incentivesProxy = await DRE.ethers.getContractAt(
        'InitializableAdminUpgradeabilityProxy',
        incentiveProxy,
        await getFirstSigner()
      );

      const encodedParams = incentivesControllerImpl.interface.encodeFunctionData('initialize', [
        rewardsVault,
      ]);

      await waitForTx(
        await incentivesProxy.functions['initialize(address,address,bytes)'](
          incentivesControllerImpl.address,
          proxyAdmin,
          encodedParams
        )
      );
      console.log(`  - Initialized  PullRewardsIncentivesController Proxy`);

      console.log(`  - Finished PullRewardsIncentivesController initialization`);
      console.log(`    - Proxy: ${incentivesProxy.address}`);
      console.log(`    - Impl: ${incentivesControllerImpl.address}`);

      return {
        proxy: incentivesProxy.address,
        implementation: incentivesControllerImpl.address,
      };
    }
  );
