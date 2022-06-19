// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import testnetAddresses from '@subql/contract-sdk/publish/testnet.json';
import { Indexer, Delegator, Consumer } from '../types';

interface Challenge_Pts {
  [key: string]: number;
}
interface Challenge_Details {
  [key: string]: string;
}

// TODO: add season3_end time
export const SEASON_2_END = 340176;

export const INDEXER_CHALLENGE_PTS: Challenge_Pts = {
  INDEX_SINGLE: 10,
  INDEX_ALL: 50,
  ATTRACT_DELEGATOR: 20,
  CHANGE_COMMISSION: 10,
  DEFAULT_PLAN: 50,
  OVERRIDE_PLAN: 50,
  SERVICE_AGREEMENT: 50,
  CLAIM_REWARD: 20,
  WITHDRAW_CLAIMED: 50,
  INDEXER_UNDELEGATED: 20,
  UNREGISTER_INDEXER: 30,
  PLAN_BY_TEMPLATE: 30,
  OFFER_ACCEPTED: 50,
};

export const INDEXER_CHALLENGE_DETAILS: Challenge_Details = {
  INDEX_SINGLE: 'Fully index a project from demo projects list',
  INDEX_ALL: 'Index all projects from demo projects list',
  ATTRACT_DELEGATOR: 'Get your first delegator',
  CHANGE_COMMISSION: 'Either increase of decrease commission rate',
  DEFAULT_PLAN: 'Create a default plan',
  OVERRIDE_PLAN: 'Create a override plan',
  SERVICE_AGREEMENT: 'Get a service agreement from consumer',
  CLAIM_REWARD: 'Indexer claims a reward',
  WITHDRAW_CLAIMED: 'Delegator withdraws unstaked amount from Indexer',
  INDEXER_UNDELEGATED: 'Indexer gets delegation removed',
  UNREGISTER_INDEXER: 'Unregister your indexer',
  PLAN_BY_TEMPLATE: 'Create a plan using a plan template',
  OFFER_ACCEPTED: 'A purchase offer is accepted by Indexer',
};

export const DELEGATOR_CHALLENGE_PTS: Challenge_Pts = {
  CLAIM_REWARD: 20,
  WITHDRAW_CLAIMED: 50,
  UNDELEGATE_INDEXER: 50,
};

export const DELEGATOR_CHALLENGE_DETAILS: Challenge_Details = {
  CLAIM_REWARD: 'Indexer claims a reward',
  WITHDRAW_CLAIMED: 'Delegator withdraws unstaked amount from indexer',
  UNDELEGATE_INDEXER: 'Delegator removed delegation to indexer',
};

export const CONSUMER_CHALLENGE_PTS: Challenge_Pts = {
  CREATE_PURCHASE_OFFER: 50,
  SERVICE_AGREEMENT: 50,
  PURCHASE_PLAN: 50,
};

export const CONSUMER_CHALLENGE_DETAILS: Challenge_Details = {
  CREATE_PURCHASE_OFFER: 'A purchase offer is created by Consumer',
  PURCHASE_PLAN: 'Purchase a plan from an indexer',
  SERVICE_AGREEMENT: 'Get a service agreement from indexer',
};

// FIXME: this will be changed for `season3`
export const TESTNET_PROJECTS = [
  'QmYR8xQgAXuCXMPGPVxxR91L4VtKZsozCM7Qsa5oAbyaQ3', //Staking Threshold - Polkadot
  'QmSzPQ9f4U1GERvN1AxJ28xq9B5s4M72CPvotmmv1N2bN7', //Staking Threshold - Kusama
];

export const QUERY_REGISTRY_ADDRESS = testnetAddresses.QueryRegistry.address;
export const ERA_MANAGER_ADDRESS = testnetAddresses.EraManager.address;
export const PLAN_MANAGER_ADDRESS = testnetAddresses.PlanManager.address;
export const REWARD_DIST_ADDRESS = testnetAddresses.RewardsDistributer.address;
export const STAKING_ADDRESS = testnetAddresses.Staking.address;
export const SA_REGISTRY_ADDRESS = testnetAddresses.ServiceAgreementRegistry.address;

export type Role = Indexer | Delegator | Consumer;

export enum RoleType {
  Indexer,
  Delegator,
  Consumer,
}

export const rolesConfig = {
  [RoleType.Indexer]: {
    name: 'Indexer',
    entity: Indexer,
    pts: INDEXER_CHALLENGE_PTS,
    details: INDEXER_CHALLENGE_DETAILS,
  },
  [RoleType.Delegator]: {
    name: 'Delegator',
    entity: Delegator,
    pts: DELEGATOR_CHALLENGE_PTS,
    details: DELEGATOR_CHALLENGE_DETAILS,
  },
  [RoleType.Consumer]: {
    name: 'Consumer',
    entity: Consumer,
    pts: CONSUMER_CHALLENGE_PTS,
    details: CONSUMER_CHALLENGE_DETAILS,
  },
};
