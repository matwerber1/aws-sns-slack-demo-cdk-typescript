import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_event_sources as lambdaSources,
  aws_secretsmanager as secretsmanager,
  aws_sns as sns,
  Duration,
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const channelName = 'aws-text-message-bot';
    const secretName = `slack-webhook-${channelName}`;

    const secret = new secretsmanager.Secret(this, 'SlackWebhookSecret', {
      secretName: secretName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ channel: channelName }),
        generateStringKey: 'webhookPath'
      }
    });

    const role = new iam.Role(this, 'SimSnSSlackHandlerLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const topic = new sns.Topic(this, 'SnsSlackTopic', {
      topicName: `slack-channel-topic-for-${channelName}`
    });

    secret.grantRead(role);
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));

    const fn = new NodejsFunction(this, 'SimSnsSlackHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, // Updated runtime
      handler: 'index.handler',
      role: role,
      timeout: Duration.seconds(10),
      entry: path.join(__dirname, 'lambda/aws-sns-slack-handler/src/index.ts'), // Updated entry
      environment: {
        WEBHOOK_SECRET_NAME: secretName
      }
    });

    fn.addEventSource(new lambdaSources.SnsEventSource(topic));
  }
}
