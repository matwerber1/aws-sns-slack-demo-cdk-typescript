// Importing AWS SDK v3 Secrets Manager client and command
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

import {Slack} from "./slack";
import {SnsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";

// Initializing the Secrets Manager client
const secretsManagerClient = new SecretsManagerClient({});

const handler = async (event: SnsEventSource) => {
	console.log('Received event:', JSON.stringify(event, null, 2));

	try {
		const webhookPathSecret: string = await getWebhookPathFromSecretsManager();
		const slack: Slack = new Slack({ webhookPath: webhookPathSecret });

		// @ts-ignore
		const message = event.Records[0].Sns.Message;
		console.log('Message received from SNS:', message);

		const slackResponse = await slack.sendMessage(message);

		const functionResponse = {
			message,
			status_code: slackResponse.statusCode,
			response: slackResponse.responseBody
		};

		console.log(JSON.stringify(functionResponse, null, 2));
		console.log('Done!');
		return functionResponse;
	} catch (error) {
		console.error('Error handling the event:', error);
		throw error;
	}
};

const getWebhookPathFromSecretsManager = async () => {
	console.log('Retrieving Slack webhook path from Secrets Manager...');
	try {
		const command = new GetSecretValueCommand({
			SecretId: process.env.WEBHOOK_SECRET_NAME
		});

		const { SecretString } = await secretsManagerClient.send(command);
		const secret = JSON.parse(SecretString || "{}");
		return secret.webhookPath;
	} catch (error) {
		console.error('Error retrieving the webhook path:', error);
		throw error;
	}
};

module.exports = { handler };
