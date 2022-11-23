import { App, Stack } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { ExpectedResult, IntegTest } from '@aws-cdk/integ-tests-alpha';

const app = new App();
const stackA = new Stack(app, 'represent-aws-cdk-integ-tests-bug-stack-a');
const queueA = new Queue(stackA, 'queue-a');
const stackB = new Stack(app, 'represent-aws-cdk-integ-tests-bug-stack-b');
const queueB = new Queue(stackB, 'queue-b');

const integ = new IntegTest(app, 'Integ', { testCases: [stackA, stackB] });

for (const queue of [queueA, queueB]) {
  const response = integ.assertions.awsApiCall('SQS', 'sendMessage', {
    QueueUrl: queue.queueUrl,
    MessageBody: 'foo'
  });
  response.provider.addToRolePolicy({
    Effect: 'Allow',
    Action: ['sqs:SendMessage'],
    Resource: [queue.queueArn],
  });
  response.expect(ExpectedResult.objectLike({}));
}

app.synth();
