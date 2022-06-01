// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FrontierEvmEvent } from '@subql/contract-processors/dist/frontierEvm';
import {
  PlanCreatedEvent,
  PlanRemovedEvent,
  PlanTemplateCreatedEvent,
  PlanTemplateMetadataChangedEvent,
  PlanTemplateStatusChangedEvent,
} from '@subql/contract-sdk/typechain/PlanManager';
import {
  bytesToIpfsCid,
  PLAN_MANAGER_ADDRESS,
  updateIndexerChallenges,
} from './utils';
import { constants } from 'ethers';

import assert from 'assert';
import { Plan, PlanTemplate } from '../types';
import { PlanManager__factory } from '@subql/contract-sdk';
import FrontierEthProvider from './ethProvider';
import { BigNumber } from '@ethersproject/bignumber';

function getPlanId(indexer: string, idx: BigNumber): string {
  return `${indexer}:${idx.toHexString()}`;
}

export async function handlePlanTemplateCreated(
  event: FrontierEvmEvent<PlanTemplateCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePlanTemplateCreated');
  assert(event.args, 'No event args');

  const planManager = PlanManager__factory.connect(
    PLAN_MANAGER_ADDRESS,
    new FrontierEthProvider()
  );

  const rawPlanTemplate = await planManager.planTemplates(
    event.args.planTemplateId
  );

  const planTemplate = PlanTemplate.create({
    id: event.args.planTemplateId.toHexString(),
    period: rawPlanTemplate.period.toBigInt(),
    dailyReqCap: rawPlanTemplate.dailyReqCap.toBigInt(),
    rateLimit: rawPlanTemplate.rateLimit.toBigInt(),
    metadata:
      constants.HashZero === rawPlanTemplate.metadata
        ? undefined
        : bytesToIpfsCid(rawPlanTemplate.metadata),
    active: true,
  });

  await planTemplate.save();
}

export async function handlePlanTemplateMetadataUpdated(
  event: FrontierEvmEvent<PlanTemplateMetadataChangedEvent['args']>
): Promise<void> {
  logger.info('handlePlanTemplateMetadataUpdated');
  assert(event.args, 'No event args');

  const id = event.args.planTemplateId.toHexString();

  const planTemplate = await PlanTemplate.get(id);
  assert(planTemplate, `Plan template not found. templateId="${id}"`);
  planTemplate.metadata = bytesToIpfsCid(event.args.metadata);

  await planTemplate.save();
}

export async function handlePlanTemplateStatusUpdated(
  event: FrontierEvmEvent<PlanTemplateStatusChangedEvent['args']>
): Promise<void> {
  logger.info('handlePlanTemplateStatusUpdated');
  assert(event.args, 'No event args');

  const id = event.args.planTemplateId.toHexString();
  const planTemplate = await PlanTemplate.get(id);
  assert(planTemplate, `Plan template not found. templateId="${id}"`);

  planTemplate.active = event.args.active;

  await planTemplate.save();
}

export async function handlePlanCreated(
  event: FrontierEvmEvent<PlanCreatedEvent['args']>
): Promise<void> {
  logger.info('handlePlanCreated');
  assert(event.args, 'No event args');

  const plan = Plan.create({
    id: getPlanId(event.args.creator, event.args.planId),
    planTemplateId: event.args.planTemplateId.toHexString(),
    creator: event.args.creator,
    price: event.args.price.toBigInt(),
    active: true,
    deploymentId:
      constants.HashZero === event.args.deploymentId
        ? undefined
        : bytesToIpfsCid(event.args.deploymentId),
  });

  if (plan.deploymentId) {
    await updateIndexerChallenges(
      event.args.creator,
      'OVERRIDE_PLAN',
      event.blockNumber
    );
  } else {
    await updateIndexerChallenges(
      event.args.creator,
      'DEFAULT_PLAN',
      event.blockNumber
    );
  }

  await plan.save();
}

export async function handlePlanRemoved(
  event: FrontierEvmEvent<PlanRemovedEvent['args']>
): Promise<void> {
  logger.info('handlePlanRemoved');
  assert(event.args, 'No event args');

  const planId = getPlanId(event.args.source, event.args.id);

  const plan = await Plan.get(planId);
  assert(plan, `Plan not found. planId="${planId}"`);

  plan.active = false;

  await plan.save();
}
