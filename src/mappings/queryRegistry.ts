// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { UpdateIndexingStatusToReadyEvent } from '@subql/contract-sdk/typechain/QueryRegistry';
import { bytesToIpfsCid, updateIndexerChallenges } from './utils';
import { QUERY_REGISTRY_ADDRESS, TESTNET_PROJECTS } from './constants';
import { QueryRegistry__factory } from '@subql/contract-sdk';
import FrontierEthProvider from './ethProvider';

export async function handleIndexingReady(
  event: AcalaEvmEvent<UpdateIndexingStatusToReadyEvent['args']>
): Promise<void> {
  logger.info('handleIndexingReady');
  assert(event.args, 'No event args');

  const { deploymentId, indexer } = event.args;
  const cid = bytesToIpfsCid(deploymentId);

  if (TESTNET_PROJECTS.includes(cid)) {
    await updateIndexerChallenges(indexer, 'INDEX_SINGLE', event.blockTimestamp);
  }

  const queryRegistry = QueryRegistry__factory.connect(
    QUERY_REGISTRY_ADDRESS,
    new FrontierEthProvider()
  );

  // FIXME: `index_all` require all the indexing status are `ready` or `indexing`?
  const numOfIndexing = await queryRegistry.numberOfIndexingDeployments(indexer);
  if (numOfIndexing.eq(TESTNET_PROJECTS.length)) {
    await updateIndexerChallenges(indexer, 'INDEX_ALL', event.blockTimestamp);
  }
}
