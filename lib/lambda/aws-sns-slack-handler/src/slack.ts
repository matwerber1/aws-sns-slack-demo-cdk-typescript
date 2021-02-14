import { asyncHttpsRequest, HttpsResponse } from "./async-https-request";

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

    constructor(props:SlackProps) {
        this.webhookPath = props.webhookPath;
    }

    public async sendMessage(message: string): Promise<HttpsResponse> {
        
        const options = {
            hostname: "hooks.slack.com",
            method: "POST",
            path: this.webhookPath,
        };
        
        console.log('Sending message to Slack...');
        return await asyncHttpsRequest(options, message);
    
    }

}

function formatDate(date:Date) {
	return new Date(date).toLocaleDateString();
}