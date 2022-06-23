// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import {
  OfferAcceptedEvent,
  PurchaseOfferCreatedEvent,
} from '@subql/contract-sdk/typechain/PurchaseOfferMarket';
import assert from 'assert';

import { updateConsumerChallenges, updateIndexerChallenges } from './utils';

export async function handleOfferAccepted(
  event: AcalaEvmEvent<OfferAcceptedEvent['args']>
): Promise<void> {
  logger.info('handleOfferAccepted');
  assert(event.args, 'No event args');

  const { indexer } = event.args;
  await updateIndexerChallenges(indexer, 'OFFER_ACCEPTED', event.blockTimestamp);
}

export async function handlePurchaseOfferCreated(
  event: AcalaEvmEvent<PurchaseOfferCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePurchaseOfferCreated');
  assert(event.args, 'No event args');

  const { consumer } = event.args;
  await updateConsumerChallenges(consumer, 'CREATE_PURCHASE_OFFER', event.blockTimestamp);
}
