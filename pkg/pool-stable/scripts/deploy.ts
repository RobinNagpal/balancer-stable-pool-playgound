import { deploy } from '@balancer-labs/v2-helpers/src/contract';
import StablePool from '@balancer-labs/v2-helpers/src/models/pools/stable/StablePool';
import { RawStablePoolDeployment } from '@balancer-labs/v2-helpers/src/models/pools/stable/types';
import Token from '@balancer-labs/v2-helpers/src/models/tokens/Token';
import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';
import VaultDeployer from '@balancer-labs/v2-helpers/src/models/vault/VaultDeployer';
import StablePoolDeployer from '@balancer-labs/v2-helpers/src/models/pools/stable/StablePoolDeployer';
import { BigNumberish, bn, fp, FP_ONE } from '@balancer-labs/v2-helpers/src/numbers';
import { currentTimestamp, MONTH } from '@balancer-labs/v2-helpers/src/time';
import { BigNumber, Contract } from 'ethers';
import fs from 'fs';
import path from 'path';

async function deployStablePool() {
  /*
  // await VaultDeployer.deploy({})
  const token1 = await Token.create({symbol: 'TOK1'});
  const token2 = await Token.create({symbol: 'TOK2'});
  console.log(token1.address)
  const tokensNested = new TokenList([token1, token2]).sort();
  const rateProvider: Contract = await deploy('v2-pool-utils/MockRateProvider');
*/

  const numberOfTokens = 2;
  let pool: StablePool;
  const tokens: TokenList = await TokenList.create(numberOfTokens, { sorted: true });
  let deployTimestamp: BigNumber, bptIndex: number, initialBalances: BigNumberish[];

  const rateProviders: Contract[] = [];
  const tokenRateCacheDurations: number[] = [];
  const exemptFromYieldProtocolFeeFlags: boolean[] = [];

  const ZEROS = Array(numberOfTokens + 1).fill(bn(0));

  const params: RawStablePoolDeployment = {};
  const rates: BigNumberish[] = [];
  const durations: number[] = [];

  for (let i = 0; i < numberOfTokens; i++) {
    rateProviders[i] = await deploy('v2-pool-utils/MockRateProvider');
    await rateProviders[i].mockRate(rates[i] || FP_ONE);
    tokenRateCacheDurations[i] = MONTH + i;
    exemptFromYieldProtocolFeeFlags[i] = i % 2 == 0; // set true for even tokens
  }

  pool = await StablePool.create({
    tokens,
    rateProviders,
    tokenRateCacheDurations: durations.length > 0 ? durations : tokenRateCacheDurations,
    exemptFromYieldProtocolFeeFlags,
  });

  bptIndex = await pool.getBptIndex();
  deployTimestamp = await currentTimestamp();
  initialBalances = Array.from({ length: numberOfTokens + 1 }).map((_, i) => (i == bptIndex ? 0 : fp(1 - i / 10)));

  console.log('pool', pool.address);
  const fs = require('fs');
  const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, 'contract-address.json'),
    JSON.stringify({ StablePool: pool.address }, undefined, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployStablePool().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
