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

// TODO: add season3_end time (blockheight) average block time: 12.4s
export const SEASON_3_END = 1583115;

export const INDEXER_CHALLENGE_PTS: Challenge_Pts = {
  INDEX_SINGLE_PROJECT: 10,
  INDEX_ALL_PROJECTS: 200,
  DELEGATOR_ATTRACTED: 20,
  CHANGE_COMMISSION: 10,
  CREATE_DEFAULT_PLAN: 50,
  CREATE_SPECIFIC_PLAN: 50,
  SERVICE_AGREEMENT_CREATED: 50,
  CLAIM_REWARD: 20,
  WITHDRAW_UNSTAKED: 50,
  INDEXER_UNDELEGATED: 20,
  ACCEPT_OFFER: 50,
  UPDATE_CONTROLLER: 30,
  // UNREGISTER_INDEXER: 30,
};

export const INDEXER_CHALLENGE_DETAILS: Challenge_Details = {
  INDEX_SINGLE_PROJECT: 'Fully index a project from projects list',
  INDEX_ALL_PROJECTS: 'Index all projects from projects list',
  DELEGATOR_ATTRACTED: 'Get your first delegator',
  CHANGE_COMMISSION: 'Either increase of decrease commission rate',
  CREATE_DEFAULT_PLAN: 'Create a default plan',
  CREATE_SPECIFIC_PLAN: 'Create a deployment-specific plan',
  SERVICE_AGREEMENT_CREATED: 'Get a service agreement from consumer',
  CLAIM_REWARD: "Indexer claims a reward from reward distributor to an indexer's wallet",
  WITHDRAW_UNSTAKED:
    "Indexer withdraws unstaked amount from staking contract to an indexer's wallet",
  INDEXER_UNDELEGATED: 'Indexer gets undelegated from delegator',
  ACCEPT_OFFER: 'Indexer to accept an offer in the offer market',
  UPDATE_CONTROLLER: 'Update controller account to new one',
  // UNREGISTER_INDEXER: 'Unregister your indexer',
};

export const DELEGATOR_CHALLENGE_PTS: Challenge_Pts = {
  CLAIM_REWARD: 20,
  DELEGATE_TO_INDEXER: 50,
  UNDELEGATE_FROM_INDEXER: 50,
  WITHDRAW_DELEGATION: 50,
};

export const DELEGATOR_CHALLENGE_DETAILS: Challenge_Details = {
  CLAIM_REWARD: "Delegator claims a reward from reward distributor to delegator's wallet",
  DELEGATE_TO_INDEXER: 'Delegator add delegation to an indexer',
  UNDELEGATE_FROM_INDEXER: 'Delegator undelegate from an indexer',
  WITHDRAW_DELEGATION: 'Delegator withdraws undelegated amount from an indexer',
};

export const CONSUMER_CHALLENGE_PTS: Challenge_Pts = {
  PURCHASE_PLAN: 50,
  CREATE_PURCHASE_OFFER: 50,
  SERVICE_AGREEMENT_CREATED: 50,
  CANCEL_PURCHASE_OFFER: 30,
  WITHDRAW_PURCHASE_OFFER: 30,
};

export const CONSUMER_CHALLENGE_DETAILS: Challenge_Details = {
  PURCHASE_PLAN: 'Consumer purchase a plan from an indexer',
  CREATE_PURCHASE_OFFER: 'A purchase offer is created by consumer',
  SERVICE_AGREEMENT_CREATED: 'Get service agreement from an indexer',
  CANCEL_PURCHASE_OFFER: 'Cancel offer before it expires',
  WITHDRAW_PURCHASE_OFFER: 'Withdraw SQT locked in the offer after it expires',
};

// season3 projects
export const TESTNET_PROJECTS = [
  'QmduAur8aCENpuizuTGLAsXumG2BX8zSgWLsVpp5b8GEGN', // Staking Threshold - Polkadot
  'QmPZrgnpCrhU3bBXvNQG8qX3VBQTyNVj7agx1hiav14imM', // Developer Fund Votes - Juno
  'QmTXSopHWTDhei9ukMAJ1huy83jM9KnGsNEkBcpQkZUCVP', // Pangolin Rewards - Avalanche
];

export const QUERY_REGISTRY_ADDRESS = testnetAddresses.QueryRegistry.address;
export const INDEXER_REGISTRY_ADDRESS = testnetAddresses.IndexerRegistry.address;
export const ERA_MANAGER_ADDRESS = testnetAddresses.EraManager.address;
export const PLAN_MANAGER_ADDRESS = testnetAddresses.PlanManager.address;
export const REWARD_DIST_ADDRESS = testnetAddresses.RewardsDistributer.address;
export const STAKING_ADDRESS = testnetAddresses.Staking.address;
export const SA_REGISTRY_ADDRESS = testnetAddresses.ServiceAgreementRegistry.address;
export const PURCHASE_OFFER_ADDRESS = testnetAddresses.PurchaseOfferMarket.address;

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
