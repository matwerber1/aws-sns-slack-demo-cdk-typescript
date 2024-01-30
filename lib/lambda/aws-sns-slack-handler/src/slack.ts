import { IncomingMessage } from "http";
import https from "https";

export interface SlackProps {
    webhookPath: string;
}

export interface IssueSummaryMessage {
    date: string;
    title: string;
    status: string;
}

export class Slack {
    protected webhookPath: string;
    hostname: string;

    constructor({ webhookPath }: SlackProps) {
        this.webhookPath = webhookPath;
        this.hostname = 'hooks.slack.com';
    }

    sendMessage(message: string): Promise<{ statusCode: number; body: string; responseBody:any }> {
        console.log('Sending message to Slack...', message, this.webhookPath)

        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                text: message,
            });

            const options = {
                hostname: this.hostname,
                path: this.webhookPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };

            console.log('Sending message to Slack...', options);

            const req = https.request(options, (res: IncomingMessage) => {
                let data = '';

                // A chunk of data has been received.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received.
                res.on('end', () => {
                    console.log('Response from Slack:', data);
                    let responseBody;
                    try {
                        responseBody = JSON.parse(data); // Attempt to parse JSON
                    } catch (e) {
                        responseBody = data; // Fallback to raw data if parsing fails
                    }
                    resolve({
                        statusCode: res.statusCode || 500,
                        body: data,
                        responseBody: JSON.parse(responseBody)
                    });
                });
            });

            req.on('error', (e: { message: string; }) => {
                console.error(`Problem with request: ${e.message}`);
                reject(e);
            });

            // Write data to request body
            req.write(postData);
            req.end();
        });
    }
}

module.exports = Slack;

function formatDate(date:Date) {
	return new Date(date).toLocaleDateString();
}