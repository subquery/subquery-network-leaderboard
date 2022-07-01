// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { ClaimRewardsEvent } from '@subql/contract-sdk/typechain/RewardsDistributer';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { updateDelegatorChallenges, updateIndexerChallenges } from './utils';

export async function handleRewardsClaimed(
  event: AcalaEvmEvent<ClaimRewardsEvent['args']>
): Promise<void> {
  logger.info('handleRewardsClaimed');
  assert(event.args, 'No event args');

  const { indexer, delegator } = event.args;

  if (indexer === delegator) {
    await updateIndexerChallenges(indexer, 'CLAIM_REWARD', event);
  } else {
    await updateDelegatorChallenges(delegator, 'CLAIM_REWARD', event);
  }
}
