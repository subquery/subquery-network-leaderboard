// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import {
  SetControllerAccountEvent,
  UnregisterIndexerEvent,
} from '@subql/contract-sdk/typechain/IndexerRegistry';
import assert from 'assert';
import { updateIndexerChallenges } from './utils';

export async function handleUpdateController(
  event: AcalaEvmEvent<SetControllerAccountEvent['args']>
): Promise<void> {
  logger.info('handleUpdateController');
  assert(event.args, 'No event args');

  const { indexer } = event.args;
  await updateIndexerChallenges(indexer, 'UPDATE_CONTROLLER', event);
}

export function handleUnregisterIndexer(
  event: AcalaEvmEvent<UnregisterIndexerEvent['args']>
): void {
  logger.info('handleUnregisterIndexer');
  assert(event.args, 'No event args');

  // TODO: will evaluate whether need this challenge in the future
  // const { indexer } = event.args;
  // await updateIndexerChallenges(indexer, 'UNREGISTER_INDEXER', event);
}
