import * as cdk from '@aws-cdk/core';
import * as chatbot from '@aws-cdk/aws-chatbot';
import * as iam from '@aws-cdk/aws-iam';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as sns from '@aws-cdk/aws-sns';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaSources from '@aws-cdk/aws-lambda-event-sources';

import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Name of the Slack channel you will post to, used to help name resources
    const channelName = 'mat-werber';

    // This stores the webhook that you must create in advance via a "Slack Workflow".
    // Initially, the code below will generate a random value for the webhook-url parameter. 
    // After you launch the CDK stack, you should manually update the secret with your actual
    // webhook. This is done so you do not accidentally commit your webhook to code, since it
    // should be considered a secret. 
    const secretName = `slack-webhook-${channelName}`;
    
    const secret = new secretsmanager.Secret(this, 'SlackWebhookSecret', {
      secretName: secretName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ channel: channelName }),
        generateStringKey: 'webhookPath'
      }
    });


    const role = new iam.Role(this, 'SimSnSSlackHandlerLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),   // required
    });

    // Messages on this SNS topic will be sent to Slack:
    const topic = new sns.Topic(this, 'SnsSlackTopic', {
      topicName: `slack-channel-topic-for-${channelName}`
    });

    // Grant Lambda permission to read our secret webhook path:
    secret.grantRead(role);

    // Required for Lambda execution:
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));

    // only required if your function lives in a VPC
    //role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"));
    
    const fn = new lambda.Function(this, 'SimSnsSlackHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      role: role,
      timeout: cdk.Duration.seconds(10), 
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/aws-sns-slack-handler/dist')),
      environment: {
        WEBHOOK_SECRET_NAME: secretName
      }
    });

    // Configure our SNS topic as an event source for our Lambda function:
    const eventSource = fn.addEventSource(new lambdaSources.SnsEventSource(topic));

  }
}