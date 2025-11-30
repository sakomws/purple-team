import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const eventBridge = new EventBridgeClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const clutchId = event.detail?.clutchId;

    if (!clutchId) {
      console.error('Missing clutchId in event detail');
      throw new Error('Missing clutchId in event detail');
    }

    const updatedClutch = await incrementProcessingComplete(clutchId);
    const { processingComplete, eggCount } = updatedClutch;

    console.log(`Clutch ${clutchId}: ${processingComplete}/${eggCount} eggs processed`);

    if (processingComplete >= eggCount) {
      await publishConsolidateFindingsEvent(clutchId);
      console.log(`All eggs processed for clutch ${clutchId}, triggered consolidation`);
    }

    return {
      clutchId,
      processingComplete,
      eggCount,
      consolidationTriggered: processingComplete >= eggCount
    };
  } catch (err) {
    console.error('Egg processing tracker failed:', err);
    throw err;
  }
};

async function incrementProcessingComplete(clutchId) {
  const response = await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CLUTCH#${clutchId}`,
      sk: 'METADATA'
    },
    UpdateExpression: 'SET processingComplete = if_not_exists(processingComplete, :zero) + :inc',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1
    },
    ReturnValues: 'ALL_NEW'
  }));

  return response.Attributes;
}

async function publishConsolidateFindingsEvent(clutchId) {
  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      Source: 'chicken-counter',
      DetailType: 'Consolidate Findings',
      Detail: JSON.stringify({ clutchId })
    }]
  }));
}
