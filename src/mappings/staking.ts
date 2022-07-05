// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Staking__factory, IndexerRegistry__factory } from '@subql/contract-sdk';
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
import { INDEXER_REGISTRY_ADDRESS, STAKING_ADDRESS } from './constants';

export async function handleAddDelegation(
  event: AcalaEvmEvent<DelegationAddedEvent['args']>
): Promise<void> {
  logger.info('handleAddDelegation');
  assert(event.args, 'No event args');

  const { source, indexer } = event.args;
  if (source !== indexer) {
    await updateIndexerChallenges(indexer, 'DELEGATOR_ATTRACTED', event);
    await updateDelegatorChallenges(source, 'DELEGATE_TO_INDEXER', event);
  }
}

export async function handleRemoveDelegation(
  event: AcalaEvmEvent<DelegationRemovedEvent['args']>
): Promise<void> {
  logger.info('handleRemoveDelegation');
  assert(event.args, 'No event args');

  const { source, indexer } = event.args;

  // TODO: do we need to filter unstake action?
  await updateIndexerChallenges(indexer, 'INDEXER_UNDELEGATED', event);
  await updateDelegatorChallenges(source, 'UNDELEGATE_FROM_INDEXER', event);
}

export async function handleWithdrawClaimed(
  event: AcalaEvmEvent<UnbondWithdrawnEvent['args']>
): Promise<void> {
  logger.info('handleWithdrawClaimed');
  assert(event.args, 'No event args');

  const { source } = event.args;
  const indexerRegistry = IndexerRegistry__factory.connect(
    INDEXER_REGISTRY_ADDRESS,
    new FrontierEthProvider()
  );

  const isIndexer = await indexerRegistry.isIndexer(source);
  if (isIndexer) {
    await updateIndexerChallenges(source, 'WITHDRAW_UNSTAKED', event);
  }

  await updateDelegatorChallenges(source, 'WITHDRAW_DELEGATION', event);
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
    await updateIndexerChallenges(indexer, 'CHANGE_COMMISSION', event);
  }
}
