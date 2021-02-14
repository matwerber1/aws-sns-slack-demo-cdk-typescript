//const https = require('https');
import * as SecretsManager from "@aws-sdk/client-secrets-manager";
import { HttpsResponse } from "./async-https-request";
import { Slack } from "./slack";

var secretsManager = new SecretsManager.SecretsManager({});

export const handler = async (event: any = {}): Promise<any> => {

	// for debugging purposes: 
	console.log('Received event:', JSON.stringify(event, null, 2));

	var webhookPath = await getWebhookPathFromSecretsManager();
	var slack = new Slack({ webhookPath: webhookPath });
	
	const message = event.Records[0].Sns.Message;
    console.log('Message received From SNS:', message);
    
	var slackResponse = await slack.sendMessage(message);

	var functionResponse = {
		message: message,
		status_code: slackResponse.statusCode,
		response: slackResponse.responseBody
	};

	console.log(JSON.stringify(functionResponse, null, 2));
	console.log('Done!');
	return functionResponse;

}

async function getWebhookPathFromSecretsManager(): Promise<string> {
	/**
	 * The secret value in Secrets Manager must be like the one below for Slack Webhooks:
	 * https://hooks.slack.com/workflows/XXXXX/XXXX/XXXX/XX
	 **/

	console.log('Retrieving Slack webhook path from Secrets Manager...');
	var data:SecretsManager.GetSecretValueCommandOutput = 
		await secretsManager.getSecretValue({
			SecretId: process.env.WEBHOOK_SECRET_NAME
	});
	
	var secret = JSON.parse(data.SecretString || "{}");
	return secret.webhookPath;

}
