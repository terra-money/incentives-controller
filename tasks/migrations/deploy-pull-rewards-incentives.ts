import { isAddress } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  deployPullRewardsIncentivesController,
  deployInitializableAdminUpgradeabilityProxy,
} from '../../helpers/contracts-accessors';

task(
  `deploy-pull-rewards-incentives`,
  `Deploy the PullRewardsIncentivesController contract`
)
  .addFlag('verify')
  .addParam('rewardToken')
  .addParam('emissionManager')
  .addParam('proxyAdmin', `The address to be added as an Admin role at the Transparent Proxy.`)
  .setAction(
    async ({ verify, rewardToken, emissionManager, proxyAdmin }, localBRE) => {
      await localBRE.run('set-DRE');
      if (!isAddress(proxyAdmin)) {
        throw Error('Missing or incorrect admin param');
      }
      if (!isAddress(rewardToken)) {
        throw Error('Missing or incorrect rewardToken param');
      }

      emissionManager = isAddress(emissionManager) ? emissionManager : ZERO_ADDRESS;

      console.log(`[PullRewardsIncentivesController] Starting deployment:`);

      const incentivesControllerImpl = await deployPullRewardsIncentivesController(
        [rewardToken, emissionManager],
        verify
      );
      console.log(`  - Deployed implementation of PullRewardsIncentivesController`);

      const incentivesProxy = await deployInitializableAdminUpgradeabilityProxy(verify);
      console.log(`  - Deployed proxy of PullRewardsIncentivesController`);

      console.log(`  - Non Initialized  PullRewardsIncentivesController Proxy`);

      console.log(`  - Finished PullRewardsIncentivesController deployment`);
      console.log(`    - Proxy: ${incentivesProxy.address}`);
      console.log(`    - Impl: ${incentivesControllerImpl.address}`);

      return {
        proxy: incentivesProxy.address,
        implementation: incentivesControllerImpl.address,
      };
    }
  );
