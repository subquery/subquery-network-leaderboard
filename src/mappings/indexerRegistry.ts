// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import {
  RegisterIndexerEvent,
  UnregisterIndexerEvent,
} from '@subql/contract-sdk/typechain/IndexerRegistry';
import assert from 'assert';
import { Indexer } from '../types';
import { updateIndexerChallenges } from './utils';

/* Indexer Registry Handlers */
export async function handleRegisterIndexer(
  event: AcalaEvmEvent<RegisterIndexerEvent['args']>
): Promise<void> {
  logger.info('handleRegisterIndexer');
  assert(event.args, 'No event args');
  const { indexer: indexerAddress } = event.args;

  let indexer = await Indexer.get(indexerAddress);
  if (indexer) {
    // Should not occurr. AddDelegation, SetCommissionRate events should happen first
    indexer = Indexer.create({
      id: indexerAddress,
      singleChallengePts: 0,
      singleChallenges: [],
    });
  }

  await indexer.save();
}

export async function handleUnregisterIndexer(
  event: AcalaEvmEvent<UnregisterIndexerEvent['args']>
): Promise<void> {
  logger.info('handleUnregisterIndexer');
  assert(event.args, 'No event args');

  const indexer = await Indexer.get(event.args.indexer);
  assert(indexer, `Expected indexer to exist: ${event.args.indexer}`);

  await updateIndexerChallenges(
    indexer.id,
    'UNREGISTER_INDEXER',
    event.blockTimestamp
  );
}
