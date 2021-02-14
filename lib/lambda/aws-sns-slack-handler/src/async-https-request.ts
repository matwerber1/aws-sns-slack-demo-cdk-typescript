import https, {RequestOptions} from "https";

export interface HttpsResponse {
  statusCode: number;
  statusMessage: string;
  responseBody: string;
}

// Basic promisification of an HTTPS request:
export async function asyncHttpsRequest(options:RequestOptions, data = ""): Promise<HttpsResponse> {

    return new Promise((resolve, reject) => {
        
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');

        let responseBody:string = '';
  
        res.on('data', (chunk:string) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          var response: HttpsResponse = {
            statusCode: res.statusCode || 500,
            statusMessage: res.statusMessage || 'Something went wrong, status message was not returned.',
            responseBody: responseBody
          };

          resolve(response);

        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
  
      req.write(data)
      req.end();
    });

  }