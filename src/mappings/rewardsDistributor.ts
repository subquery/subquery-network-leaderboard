// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Delegation, Reward, UnclaimedReward } from '../types';
import { RewardsDistributer__factory } from '@subql/contract-sdk';
import FrontierEthProvider from './ethProvider';
import {
  ClaimRewardsEvent,
  DistributeRewardsEvent,
} from '@subql/contract-sdk/typechain/RewardsDistributer';
import {
  REWARD_DIST_ADDRESS,
  updateDelegatorChallenges,
  updateIndexerChallenges,
} from './utils';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';

function buildRewardId(indexer: string, delegator: string): string {
  return `${indexer}:${delegator}`;
}

export async function handleRewardsDistributed(
  event: AcalaEvmEvent<DistributeRewardsEvent['args']>
): Promise<void> {
  logger.info('handleRewardsDistributed');
  assert(event.args, 'No event args');

  const { indexer } = event.args;
  const delegators = await Delegation.getByIndexerId(indexer);
  if (!delegators) return;

  const rewardsDistributor = RewardsDistributer__factory.connect(
    REWARD_DIST_ADDRESS,
    new FrontierEthProvider()
  );

  await Promise.all(
    delegators.map(async (delegator) => {
      const rewards = await rewardsDistributor.userRewards(
        indexer,
        delegator.delegatorId
      );
      const id = buildRewardId(indexer, delegator.delegatorId);

      let reward = await UnclaimedReward.get(id);

      if (!reward) {
        reward = UnclaimedReward.create({
          id,
          delegatorAddress: delegator.delegatorId,
          indexerAddress: indexer,
          amount: rewards.toBigInt(),
        });
      } else {
        reward.amount = rewards.toBigInt();
      }

      await reward.save();
    })
  );
}

export async function handleRewardsClaimed(
  event: AcalaEvmEvent<ClaimRewardsEvent['args']>
): Promise<void> {
  logger.info('handleRewardsClaimed');
  assert(event.args, 'No event args');

  const id = buildRewardId(event.args.indexer, event.args.delegator);

  const unclaimed = await UnclaimedReward.get(id);

  assert(
    event.args.rewards.isZero() ||
      unclaimed?.amount === event.args.rewards.toBigInt(),
    `unclaimed reward doesn't match claimed reward ${
      unclaimed?.amount
    } ${event.args.rewards.toBigInt()}`
  );

  await UnclaimedReward.remove(id);

  const reward = Reward.create({
    id: `${id}:${event.transactionHash}`,
    indexerAddress: event.args.indexer,
    delegatorAddress: event.args.delegator,
    amount: event.args.rewards.toBigInt(),
    claimedTime: event.blockTimestamp,
  });

  await reward.save();
  await updateIndexerChallenges(
    event.args.indexer,
    'CLAIM_REWARD',
    event.blockTimestamp
  );
  await updateDelegatorChallenges(
    event.args.delegator,
    'CLAIM_REWARD',
    event.blockTimestamp
  );
}
