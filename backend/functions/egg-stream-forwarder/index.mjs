import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const sqs = new SQSClient({});
const QUEUE_URL = process.env.QUEUE_URL;

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const newImage = record.dynamodb.NewImage;
      const item = unmarshall(newImage);

      await sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(item)
      }));

      console.log('Forwarded egg record to SQS:', item.sk);
    }
  }

  return { statusCode: 200 };
};
