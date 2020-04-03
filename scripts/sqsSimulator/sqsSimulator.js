const { SQS } = require('aws-sdk');

let errorCount = 0;

class SQSPublisher {
  constructor(sqs, queueUrl, { sender = 'default-sender' }) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
    this.sender = sender;
  }

  async publishToSQS(body, id) {
    const publishParams = {
      MessageBody: body,
      QueueUrl: this.queueUrl
    };

    try {
      const response = await this.sqs.sendMessage(publishParams).promise();
      const messageId = response.MessageId;
      return messageId;
    } catch (err) {
      console.log('Publish to SQS Error', err);
      return `error: ${++errorCount}`;
    }
  }
}

const sqs = new SQS({
  region: 'us-east-1',
  accessKeyId: '***',
  secretAccessKey: '***'
});

const sqsPublisher = new SQSPublisher(
  sqs,
  'QUEUE_URL',
  {
    sender: 'TEST_PERFORMANCE_T2.nano'
  }
);

(async function() {
  console.time('totalTime');
  const resultsPromises = [];
  for (let i = 1; i <= 10000; i++) {
    const body = `TEST_${i}`;
    resultsPromises.push(sqsPublisher.publishToSQS('TEST_PERFORMANCE', body, i));
  }
  const results = await Promise.all(resultsPromises);
  results.map((result) => console.log('MessageId:', result));
  console.timeEnd('totalTime');
  console.log('Total errors:', errorCount);
})();
