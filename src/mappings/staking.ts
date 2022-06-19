// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Staking__factory } from '@subql/contract-sdk';
import {
  DelegationAddedEvent,
  DelegationRemovedEvent,
  UnbondWithdrawnEvent,
  SetCommissionRateEvent,
} from '@subql/contract-sdk/typechain/Staking';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import assert from 'assert';
import FrontierEthProvider from './ethProvider';
import { updateIndexerChallenges, updateDelegatorChallenges } from './utils';
import { STAKING_ADDRESS } from './constants';

export async function handleAddDelegation(
  event: AcalaEvmEvent<DelegationAddedEvent['args']>
): Promise<void> {
  logger.info('handleAddDelegation');
  assert(event.args, 'No event args');

  const { source, indexer } = event.args;
  if (source !== indexer) {
    await updateIndexerChallenges(indexer, 'ATTRACT_DELEGATOR', event.blockTimestamp);
  }
}

export async function handleRemoveDelegation(
  event: AcalaEvmEvent<DelegationRemovedEvent['args']>
): Promise<void> {
  logger.info('handleRemoveDelegation');
  assert(event.args, 'No event args');

  const { source, indexer } = event.args;

  // TODO: do we need to filter unstake action?
  await updateIndexerChallenges(indexer, 'INDEXER_UNDELEGATED', event.blockTimestamp);
  await updateDelegatorChallenges(source, 'UNDELEGATE_INDEXER', event.blockTimestamp);
}

export async function handleWithdrawClaimed(
  event: AcalaEvmEvent<UnbondWithdrawnEvent['args']>
): Promise<void> {
  logger.info('handleWithdrawClaimed');
  assert(event.args, 'No event args');

  const { source: delegator } = event.args;

  // FIXME: need to figure out how to get `indexer` address
  // await updateIndexerChallenges(
  //   withdrawl.indexer,
  //   'WITHDRAW_CLAIMED',
  //   event.blockTimestamp
  // );
  await updateDelegatorChallenges(delegator, 'WITHDRAW_CLAIMED', event.blockTimestamp);
}

export async function handleSetCommissionRate(
  event: AcalaEvmEvent<SetCommissionRateEvent['args']>
): Promise<void> {
  logger.info('handleSetCommissionRate');
  assert(event.args, 'No event args');

  const { indexer } = event.args;
  const staking = Staking__factory.connect(STAKING_ADDRESS, new FrontierEthProvider());
  const commissionRates = await staking.commissionRates(indexer);
  const { valueAt, valueAfter } = commissionRates;

  if (valueAt !== valueAfter) {
    await updateIndexerChallenges(indexer, 'CHANGE_COMMISSION', event.blockTimestamp);
  }
}
