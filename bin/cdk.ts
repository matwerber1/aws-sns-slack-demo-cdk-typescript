#!/usr/bin/env node
import 'source-map-support/register';
import {CdkStack} from "../lib/cdk-stack";
import {App} from "aws-cdk-lib";

const app = new App();

const env = {
    region: 'us-east-1',
};

new CdkStack(app, 'CdkStack', {
    env: env,
    stackName: 'aws-sns-slack-handler'
});
