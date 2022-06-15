// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import {
  OfferAcceptedEvent,
  PurchaseOfferCreatedEvent,
} from '@subql/contract-sdk/typechain/PurchaseOfferMarket';
import { Indexer, Consumer } from '../types';

import { updateConsumerChallenges, updateIndexerChallenges } from './utils';
import assert from 'assert';

export async function handleOfferAccepted(
  event: AcalaEvmEvent<OfferAcceptedEvent['args']>
): Promise<void> {
  const indexer = await Indexer.get(event.address);
  assert(indexer, `Expected indexer to exist: ${event.address}`);

  await updateIndexerChallenges(
    event.address,
    'OFFER_ACCEPTED',
    event.blockTimestamp
  );
}

export async function handlePurchaseOfferCreated(
  event: AcalaEvmEvent<PurchaseOfferCreatedEvent['args']>
): Promise<void> {
  const consumer = await Consumer.get(event.address);

  //FIXME: could be created on another event but this is the only consumer challenge for now
  if (!consumer) {
    const consumer = Consumer.create({
      id: event.address,
      singleChallengePts: 0,
      singleChallenges: [],
    });

    await consumer.save();
  }

  await updateConsumerChallenges(
    event.address,
    'CREATE_PURCHASE_OFFER',
    event.blockTimestamp
  );
}
