import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const bedrockClient = new BedrockRuntimeClient({});
const s3Client = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event) => {
  try {
    const clutchId = event.detail?.clutchId;

    if (!clutchId) {
      console.error('Missing clutchId in event detail');
      throw new Error('Missing clutchId in event detail');
    }

    const { metadata, eggs } = await queryClutchAndEggs(clutchId);

    if (!metadata) {
      console.error(`Clutch not found: ${clutchId}`);
      throw new Error(`Clutch not found: ${clutchId}`);
    }

    const { totalEggCount, viableEggCount } = calculateEggCounts(eggs);
    const viableEggs = getViableEggs(eggs);

    console.log(`Clutch ${clutchId}: ${totalEggCount} total eggs, ${viableEggCount} viable`);

    let chickenImageKey = null;

    if (viableEggCount > 0) {
      try {
        const imageBytes = await generateChickenImage(viableEggs);
        if (imageBytes) {
          chickenImageKey = await storeImageInS3(clutchId, imageBytes);
        }
      } catch (err) {
        console.error('Image generation failed:', err);
      }
    }

    await updateClutchRecord(clutchId, totalEggCount, viableEggCount, chickenImageKey);

    return {
      clutchId,
      totalEggCount,
      viableEggCount,
      chickenImageKey
    };
  } catch (err) {
    console.error('Consolidation failed:', err);
    throw err;
  }
};

async function queryClutchAndEggs(clutchId) {
  const response = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `CLUTCH#${clutchId}`
    }
  }));

  const items = response.Items || [];
  const metadata = items.find(item => item.sk === 'METADATA');
  const eggs = items.filter(item => item.sk.startsWith('EGG#'));

  return { metadata, eggs };
}

function calculateEggCounts(eggs) {
  const totalEggCount = eggs.length;
  const viableEggCount = eggs.filter(egg => egg.hatchLikelihood >= 50).length;

  return { totalEggCount, viableEggCount };
}

function getViableEggs(eggs) {
  return eggs.filter(egg => egg.hatchLikelihood >= 50);
}

export function buildChickenImagePrompt(viableEggs) {
  const viableCount = viableEggs.length;

  if (viableCount === 0) {
    return null;
  }

  const chickenDescriptions = viableEggs.map((egg, index) => {
    const appearance = egg.chickenAppearance || {};
    const breed = egg.predictedChickBreed || 'mixed breed';
    const plumage = appearance.plumageColor || 'brown';
    const comb = appearance.combType || 'single';
    const body = appearance.bodyType || 'medium';
    const pattern = appearance.featherPattern || 'solid';
    const legs = appearance.legColor || 'yellow';

    return `- Chicken ${index + 1}: A true-to-breed ${breed} chicken with authentic ${plumage} ${pattern} plumage, characteristic ${comb} comb, ${body} build, and ${legs} legs`;
  }).join('\n');

  return `A photorealistic photograph of ${viableCount} adult chicken${viableCount > 1 ? 's' : ''} foraging and scratching in a lush green grassy pasture on a sunny day.
Each chicken must be anatomically accurate and true to its specific breed characteristics:
${chickenDescriptions}
The chickens are actively scratching the ground, pecking at grass, and foraging naturally. Soft golden sunlight, shallow depth of field, detailed feather textures showing breed-specific patterns, professional wildlife photography style.`;
}

async function generateChickenImage(viableEggs) {
  const prompt = buildChickenImagePrompt(viableEggs);

  if (!prompt) {
    return null;
  }

  const requestBody = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: prompt
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      height: 1024,
      width: 1024,
      quality: 'standard'
    }
  };

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'amazon.nova-canvas-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody)
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const imageBase64 = responseBody.images?.[0];

  if (!imageBase64) {
    throw new Error('No image returned from Nova Canvas');
  }

  return Buffer.from(imageBase64, 'base64');
}

async function storeImageInS3(clutchId, imageBytes) {
  const key = `clutches/${clutchId}/chickens.png`;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBytes,
    ContentType: 'image/png',
    ACL: 'public-read'
  }));

  return key;
}

async function updateClutchRecord(clutchId, totalEggCount, viableEggCount, chickenImageKey) {
  const consolidatedAt = new Date().toISOString();

  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CLUTCH#${clutchId}`,
      sk: 'METADATA'
    },
    UpdateExpression: 'SET totalEggCount = :total, viableEggCount = :viable, chickenImageKey = :imageKey, consolidatedAt = :consolidatedAt',
    ExpressionAttributeValues: {
      ':total': totalEggCount,
      ':viable': viableEggCount,
      ':imageKey': chickenImageKey,
      ':consolidatedAt': consolidatedAt
    }
  }));
}
