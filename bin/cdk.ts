#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

const env = {
    region: 'us-west-2',
};

new CdkStack(app, 'CdkStack', {
    env: env,
    stackName: 'aws-sns-slack-handler'
});
