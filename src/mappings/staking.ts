// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EraManager__factory } from '@subql/contract-sdk';
import {
  DelegationAddedEvent,
  DelegationRemovedEvent,
  UnbondRequestedEvent,
  UnbondWithdrawnEvent,
  SetCommissionRateEvent,
} from '@subql/contract-sdk/typechain/Staking';
import assert from 'assert';
import { Delegation, Withdrawl, Indexer } from '../types';
import FrontierEthProvider from './ethProvider';
import {
  ERA_MANAGER_ADDRESS,
  upsertEraValue,
  updateIndexerChallenges,
  updateTotalDelegation,
  updateTotalStake,
  updateDelegatorChallenges,
} from './utils';
import { BigNumber } from '@ethersproject/bignumber';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';

function getDelegationId(delegator: string, indexer: string): string {
  return `${delegator}:${indexer}`;
}

function getWithdrawlId(delegator: string, index: BigNumber): string {
  return `${delegator}:${index.toHexString()}`;
}

export async function handleAddDelegation(
  event: AcalaEvmEvent<DelegationAddedEvent['args']>
): Promise<void> {
  logger.info('handleAddDelegation');
  assert(event.args, 'No event args');

  const { source, indexer, amount } = event.args;
  const id = getDelegationId(source, indexer);
  const eraManager = EraManager__factory.connect(
    ERA_MANAGER_ADDRESS,
    new FrontierEthProvider()
  );

  const amountBn = amount.toBigInt();
  let delegation = await Delegation.get(id);

  await updateTotalDelegation(
    eraManager,
    source,
    amountBn,
    'add',
    indexer === source && !delegation
  );

  if (!delegation) {
    // Indexers first stake is effective immediately
    const eraAmount = await upsertEraValue(
      eraManager,
      undefined,
      amountBn,
      'add',
      indexer === source
    );

    delegation = Delegation.create({
      id,
      delegatorId: source,
      indexerId: indexer,
      amount: eraAmount,
    });

    await updateTotalStake(
      eraManager,
      indexer,
      amountBn,
      'add',
      indexer === source
    );
  } else {
    delegation.amount = await upsertEraValue(
      eraManager,
      delegation.amount,
      amountBn
    );

    await updateTotalStake(eraManager, indexer, amountBn, 'add');
  }

  await delegation.save();

  if (source !== indexer) {
    await updateIndexerChallenges(
      indexer,
      'ATTRACT_DELEGATOR',
      event.blockTimestamp
    );
  }
}

export async function handleRemoveDelegation(
  event: AcalaEvmEvent<DelegationRemovedEvent['args']>
): Promise<void> {
  logger.info('handleRemoveDelegation');
  assert(event.args, 'No event args');

  const { source, indexer, amount } = event.args;
  const id = getDelegationId(source, indexer);
  const eraManager = EraManager__factory.connect(
    ERA_MANAGER_ADDRESS,
    new FrontierEthProvider()
  );

  const delegation = await Delegation.get(id);

  // Entity has already been removed when indexer unregisters
  if (!delegation) return;

  delegation.amount = await upsertEraValue(
    eraManager,
    delegation.amount,
    amount.toBigInt(),
    'sub'
  );

  await updateTotalDelegation(eraManager, source, amount.toBigInt(), 'sub');
  await updateTotalStake(eraManager, indexer, amount.toBigInt(), 'sub');

  await delegation.save();
  await updateIndexerChallenges(
    delegation.indexerId,
    'INDEXER_UNDELEGATED',
    event.blockTimestamp
  );
  await updateDelegatorChallenges(
    delegation.delegatorId,
    'UNDELEGATE_INDEXER',
    event.blockTimestamp
  );
}

/* TODO wait for new contracts */
export async function handleWithdrawRequested(
  event: AcalaEvmEvent<UnbondRequestedEvent['args']>
): Promise<void> {
  logger.info('handleWithdrawRequested');
  assert(event.args, 'No event args');

  const { source, indexer, index, amount } = event.args;
  const id = getWithdrawlId(source, index);

  const withdrawl = Withdrawl.create({
    id,
    delegator: source,
    indexer,
    index: index.toBigInt(),
    startTime: event.blockTimestamp,
    amount: amount.toBigInt(),
    claimed: false,
  });

  await withdrawl.save();
}

export async function handleWithdrawClaimed(
  event: AcalaEvmEvent<UnbondWithdrawnEvent['args']>
): Promise<void> {
  logger.info('handleWithdrawClaimed');
  assert(event.args, 'No event args');

  const { source, index } = event.args;
  const id = getWithdrawlId(source, index);

  const withdrawl = await Withdrawl.get(id);
  assert(withdrawl, `Expected withdrawl (${id}) to exist`);

  withdrawl.claimed = true;

  await withdrawl.save();
  await updateIndexerChallenges(
    withdrawl.indexer,
    'WITHDRAW_CLAIMED',
    event.blockTimestamp
  );
  await updateDelegatorChallenges(
    withdrawl.delegator,
    'WITHDRAW_CLAIMED',
    event.blockTimestamp
  );
}

export async function handleSetCommissionRate(
  event: AcalaEvmEvent<SetCommissionRateEvent['args']>
): Promise<void> {
  logger.info('handleSetCommissionRate');
  assert(event.args, 'No event args');

  const address = event.args.indexer;
  const eraManager = EraManager__factory.connect(
    ERA_MANAGER_ADDRESS,
    new FrontierEthProvider()
  );

  let indexer = await Indexer.get(address);

  if (!indexer) {
    indexer = Indexer.create({
      id: address,
      metadata: '',
      totalStake: {
        era: -1,
        value: BigInt(0).toJSONType(),
        valueAfter: BigInt(0).toJSONType(),
      },
      commission: {
        era: -1,
        value: BigInt(0).toJSONType(),
        valueAfter: BigInt(0).toJSONType(),
      },
      singleChallengePts: 0,
      singleChallenges: [],
      demoProjectsIndexed: [],
      active: true,
    });
  }

  // assert(indexer, `Expected indexer (${address}) to exist`);

  indexer.commission = await upsertEraValue(
    eraManager,
    indexer.commission,
    event.args.amount.toBigInt(),
    'replace',
    // Apply instantly when era is -1, this is an indication that indexer has just registered
    indexer.commission.era === -1
  );

  await indexer.save();

  if (indexer.commission.value !== indexer.commission.valueAfter) {
    await updateIndexerChallenges(
      indexer.id,
      'CHANGE_COMMISSION',
      event.blockTimestamp
    );
  }
}
