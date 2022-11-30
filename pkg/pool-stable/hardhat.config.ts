import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-ignore-warnings';
import "@nomicfoundation/hardhat-toolbox";

import { hardhatBaseConfig } from '@balancer-labs/v2-common';
import { name } from './package.json';

import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import overrideQueryFunctions from '@balancer-labs/v2-helpers/plugins/overrideQueryFunctions';

require("dotenv").config();

task(TASK_COMPILE).setAction(overrideQueryFunctions);

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      mnemonic: process.env.ACCOUNT_NEUMONIC,
    },
    localhost: {
      allowUnlimitedContractSize: true,
      mnemonic: process.env.ACCOUNT_NEUMONIC,
    },
  },
  solidity: {
    compilers: hardhatBaseConfig.compilers,
    overrides: { ...hardhatBaseConfig.overrides(name) },
  },
  warnings: hardhatBaseConfig.warnings,
};
