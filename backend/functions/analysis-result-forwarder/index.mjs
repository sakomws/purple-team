import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const sqs = new SQSClient({});
const QUEUE_URL = process.env.QUEUE_URL;

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      const newImage = record.dynamodb.NewImage;
      const item = unmarshall(newImage);

      // Only forward if hatchLikelihood exists AND chickImageUrl doesn't exist yet
      if (item.hatchLikelihood !== undefined && !item.chickImageUrl) {
        await sqs.send(new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(item)
        }));

        console.log('Forwarded analyzed egg to queue:', item.sk, 'Hatch likelihood:', item.hatchLikelihood);
      } else if (item.chickImageUrl) {
        console.log('Skipping - already has chickImageUrl:', item.sk);
      }
    }
  }

  return { statusCode: 200 };
};
