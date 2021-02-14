#!/bin/bash

(cd lib/lambda/aws-sns-slack-handler && npm run build)
cdk synth --no-staging > template.yaml
sam local invoke SimSnsSlackHandlerFunctionEF4BAE62 -l output.txt -e sample-sns-event.json
