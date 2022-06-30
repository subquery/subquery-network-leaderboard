// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PlanCreatedEvent } from '@subql/contract-sdk/typechain/PlanManager';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import assert from 'assert';
import { constants } from 'ethers';

import { updateIndexerChallenges } from './utils';

export async function handlePlanCreated(
  event: AcalaEvmEvent<PlanCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePlanCreated');
  assert(event.args, 'No event args');

  const { creator, deploymentId } = event.args;
  const challengeType =
    constants.HashZero === deploymentId ? 'CREATE_DEFAULT_PLAN' : 'CREATE_SPECIFIC_PLAN';
  await updateIndexerChallenges(creator, challengeType, event.blockTimestamp, event.blockNumber);
}
