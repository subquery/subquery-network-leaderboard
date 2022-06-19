// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { ClosedAgreementCreatedEvent } from '@subql/contract-sdk/typechain/ServiceAgreementRegistry';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';
import { updateConsumerChallenges, updateIndexerChallenges } from './utils';
import { IClosedServiceAgreement__factory } from '@subql/contract-sdk';
import FrontierEthProvider from './ethProvider';

export async function handleServiceAgreementCreated(
  event: AcalaEvmEvent<ClosedAgreementCreatedEvent['args']>
): Promise<void> {
  logger.info('handleClosedServiceAgreementCreated');
  assert(event.args, 'No event args');

  const { indexer, consumer, serviceAgreement: contractAddress } = event.args;
  const serviceAgreement = IClosedServiceAgreement__factory.connect(
    contractAddress,
    new FrontierEthProvider()
  );

  // planId == 0 => agreement is created from `acceptPurchaseOffer`
  // planId != 0 => agreement is created from `purchasePlan`
  const planId = await serviceAgreement.planId();

  if (planId.eq(0)) {
    await updateIndexerChallenges(indexer, 'SERVICE_AGREEMENT', event.blockTimestamp);
  } else {
    await updateConsumerChallenges(consumer, 'SERVICE_AGREEMENT', event.blockTimestamp);
  }
}
