#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { BackendStack } from '../lib/backend-stack';
import { UiStack } from '../lib/ui-stack';


const user1Email = process.env.USER1_EMAIL;
const user1Name = process.env.USER1_NAME;

const user2Email = process.env.USER2_EMAIL;
const user2Name = process.env.USER2_NAME;

if (!user1Email || !user1Name) {
  throw new Error(`Both USER1_NAME and USER1_EMAIL environment variables have to be defined to be able to create user1.`)
}

// creating user2 is optional
if (user2Email || user2Name) {
  // if one of the required arguments is missing
  if (!user2Email || !user2Name) {
    throw new Error(`User2 is optional. However if needed, then both USER2_NAME and USER2_EMAIL environment variables have to be defined to be able to create user2.`)
  }
}

export const app = new cdk.App();
new BackendStack(app, 'AppSyncDemoBackendStack', {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION,
  },
  user1Email: user1Email,
  user1Name: user1Name,
  user2Email: user2Email,
  user2Name: user2Name,
});

new UiStack(app, 'AppSyncDemoUiStack', {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION
  },
})
