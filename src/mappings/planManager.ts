// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PlanManager__factory } from '@subql/contract-sdk';
import { PlanCreatedEvent } from '@subql/contract-sdk/typechain/PlanManager';
import { PLAN_MANAGER_ADDRESS, updateIndexerChallenges } from './utils';

import assert from 'assert';
import { constants } from 'ethers';
import FrontierEthProvider from './ethProvider';
import { AcalaEvmEvent } from '@subql/acala-evm-processor';

export async function handlePlanCreated(
  event: AcalaEvmEvent<PlanCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePlanCreated');
  assert(event.args, 'No event args');

  const { creator, deploymentId } = event.args;
  const challengeType =
    constants.HashZero === deploymentId ? 'DEFAULT_PLAN' : 'OVERRIDE_PLAN';

  await updateIndexerChallenges(creator, challengeType, event.blockTimestamp);

  const planManager = PlanManager__factory.connect(
    PLAN_MANAGER_ADDRESS,
    new FrontierEthProvider()
  );

  const template = await planManager.planTemplates(event.args.planTemplateId);

  if (template) {
    await updateIndexerChallenges(
      creator,
      'PLAN_BY_TEMPLATE',
      event.blockTimestamp
    );
  }
}
