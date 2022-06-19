// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import bs58 from 'bs58';
import { Delegator, Indexer } from '../types';
import {
  INDEXER_CHALLENGE_PTS,
  INDEXER_CHALLENGE_DETAILS,
  DELEGATOR_CHALLENGE_PTS,
  DELEGATOR_CHALLENGE_DETAILS,
  CONSUMER_CHALLENGE_PTS,
  CONSUMER_CHALLENGE_DETAILS,
} from './constants';

export function bytesToIpfsCid(raw: string): string {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + raw.slice(2);
  const hashBytes = Buffer.from(hashHex, 'hex');
  return bs58.encode(hashBytes);
}

export async function updateIndexerChallenges(
  indexerAddress: string,
  challengeType: string,
  blockTimestamp: Date
): Promise<void> {
  const indexerRecord = await Indexer.get(indexerAddress);

  if (!indexerRecord) {
    logger.warn(`cannot find indexer to add challenge: ${indexerAddress}, ${challengeType}`);
    return;
  }

  const result = indexerRecord.singleChallenges.findIndex(({ title }) => title === challengeType);

  if (result === -1) {
    const length = indexerRecord.singleChallenges.push({
      title: challengeType,
      points: INDEXER_CHALLENGE_PTS[challengeType],
      details: INDEXER_CHALLENGE_DETAILS[challengeType],
      timestamp: blockTimestamp,
    });

    indexerRecord.singleChallengePts += indexerRecord.singleChallenges[length - 1].points;
  }

  logger.info(
    `updateIndexerChallenges: ${indexerAddress}, ${challengeType}, ${result}, ${JSON.stringify(
      indexerRecord.singleChallenges
    )}`
  );

  await indexerRecord.save();
}

export async function updateDelegatorChallenges(
  delegatorAddress: string,
  challengeType: string,
  blockTimestamp: Date
): Promise<void> {
  const delegatorRecord = await Delegator.get(delegatorAddress);

  logger.info(
    `updateDelegatorChallenges: ${delegatorAddress}, ${challengeType}, ${
      delegatorRecord ? 'true' : 'false'
    } `
  );

  if (!delegatorRecord) {
    logger.warn(`cannot find delegator to add challenge: ${delegatorAddress}, ${challengeType}`);
    return;
  }

  const result = delegatorRecord.singleChallenges.findIndex(({ title }) => title === challengeType);

  if (result === -1) {
    const length = delegatorRecord.singleChallenges.push({
      title: challengeType,
      points: DELEGATOR_CHALLENGE_PTS[challengeType],
      details: DELEGATOR_CHALLENGE_DETAILS[challengeType],
      timestamp: blockTimestamp,
    });

    delegatorRecord.singleChallengePts += delegatorRecord.singleChallenges[length - 1].points;
  }

  await delegatorRecord.save();
}

export async function updateConsumerChallenges(
  delegatorAddress: string,
  challengeType: string,
  blockTimestamp: Date
): Promise<void> {
  const delegatorRecord = await Delegator.get(delegatorAddress);

  logger.info(
    `updateDelegatorChallenges: ${delegatorAddress}, ${challengeType}, ${
      delegatorRecord ? 'true' : 'false'
    } `
  );

  if (!delegatorRecord) {
    logger.warn(`cannot find delegator to add challenge: ${delegatorAddress}, ${challengeType}`);
    return;
  }

  const result = delegatorRecord.singleChallenges.findIndex(({ title }) => title === challengeType);

  if (result === -1) {
    const length = delegatorRecord.singleChallenges.push({
      title: challengeType,
      points: CONSUMER_CHALLENGE_PTS[challengeType],
      details: CONSUMER_CHALLENGE_DETAILS[challengeType],
      timestamp: blockTimestamp,
    });

    delegatorRecord.singleChallengePts += delegatorRecord.singleChallenges[length - 1].points;
  }

  await delegatorRecord.save();
}
