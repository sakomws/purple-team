import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const bedrock = new BedrockRuntimeClient({});
const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const eventBridge = new EventBridgeClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event) => {
  for (const record of event.Records) {
    const eggRecord = JSON.parse(record.body);
    const { pk, sk, hatchLikelihood, predictedChickBreed, chickenAppearance } = eggRecord;
    const eggId = sk.replace('EGG#', '');

    // Skip if hatchLikelihood < 70
    if (hatchLikelihood < 70) {
      console.log(`Skipping egg ${eggId} - hatchLikelihood ${hatchLikelihood} < 70`);
      continue;
    }

    // Skip if already has a chick image (prevent reprocessing)
    if (eggRecord.chickImageUrl) {
      console.log(`Skipping egg ${eggId} - already has chickImageUrl`);
      continue;
    }

    console.log(`Generating chick image for egg ${eggId} with hatchLikelihood ${hatchLikelihood}`);

    try {
      // Build prompt from chicken appearance
      const appearance = chickenAppearance || {};
      const prompt = buildPrompt(predictedChickBreed, appearance);

      // Generate image with Nova Canvas
      const imageBase64 = await generateImage(prompt);

      // Upload to S3
      const s3Key = `chicks/${pk}/${eggId}.png`;
      await uploadToS3(s3Key, imageBase64);

      const s3Uri = `s3://${BUCKET_NAME}/${s3Key}`;
      console.log(`Uploaded chick image to ${s3Uri}`);

      // Update DynamoDB record
      await updateRecord(pk, sk, s3Uri);
      console.log(`Updated egg record ${eggId} with chickImageUrl`);

      // Fire Egg Processing Completed event
      const clutchId = pk.replace('CLUTCH#', '');
      await publishEggProcessingCompleted(clutchId, eggId);
      console.log(`Published Egg Processing Completed event for clutch ${clutchId}`);

    } catch (err) {
      console.error(`Error generating chick image for ${eggId}:`, err);
      throw err; // Let SQS retry
    }
  }

  return { statusCode: 200 };
};

async function publishEggProcessingCompleted(clutchId, eggId) {
  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      Source: 'chicken-counter',
      DetailType: 'Egg Processing Completed',
      Detail: JSON.stringify({ clutchId, eggId })
    }]
  }));
}


function buildPrompt(breed, appearance) {
  const plumage = appearance.plumageColor || 'yellow';
  const comb = appearance.combType || 'single';
  const body = appearance.bodyType || 'medium';
  const pattern = appearance.featherPattern || 'solid';
  const legs = appearance.legColor || 'yellow';

  return `A photorealistic image of a cute baby chick, ${breed || 'mixed breed'} breed. ` +
    `The chick has ${plumage} downy feathers, a small ${comb} comb beginning to form, ` +
    `${body} body proportions, ${pattern} feather pattern emerging, and ${legs} legs. ` +
    `The chick is standing on clean straw in a warm brooder with soft lighting. ` +
    `Professional poultry photography style, high detail, adorable expression.`;
}

async function generateImage(prompt) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'amazon.nova-canvas-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: prompt
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        width: 1024,
        height: 1024,
        quality: 'standard'
      }
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.images[0]; // Base64 encoded image
}

async function uploadToS3(key, base64Image) {
  const buffer = Buffer.from(base64Image, 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    ACL: 'public-read'
  }));
}

async function updateRecord(pk, sk, s3Uri) {
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { pk, sk },
    UpdateExpression: 'SET chickImageUrl = :url, chickImageGeneratedAt = :ts',
    ExpressionAttributeValues: {
      ':url': s3Uri,
      ':ts': new Date().toISOString()
    }
  }));
}
