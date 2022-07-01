// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import {
  PurchaseOfferCreatedEvent,
  PurchaseOfferCancelledEvent,
} from '@subql/contract-sdk/typechain/PurchaseOfferMarket';
import { PurchaseOfferMarket__factory } from '@subql/contract-sdk';
import assert from 'assert';

import { updateConsumerChallenges } from './utils';
import { PURCHASE_OFFER_ADDRESS } from './constants';
import FrontierEthProvider from './ethProvider';

export async function handlePurchaseOfferCreated(
  event: AcalaEvmEvent<PurchaseOfferCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePurchaseOfferCreated');
  assert(event.args, 'No event args');

  const { consumer } = event.args;
  await updateConsumerChallenges(consumer, 'CREATE_PURCHASE_OFFER', event);
}

export async function handlePurchaseOfferCancelled(
  event: AcalaEvmEvent<PurchaseOfferCancelledEvent['args']>
): Promise<void> {
  logger.info('handlePurchaseOfferCancelled');
  assert(event.args, 'No event args');

  const { creator, offerId } = event.args;
  const purchaseOfferMarket = PurchaseOfferMarket__factory.connect(
    PURCHASE_OFFER_ADDRESS,
    new FrontierEthProvider()
  );
  const isExpired = await purchaseOfferMarket.isExpired(offerId);

  const challenge = isExpired ? 'WITHDRAW_PURCHASE_OFFER' : 'CANCEL_PURCHASE_OFFER';
  await updateConsumerChallenges(creator, challenge, event);
}
