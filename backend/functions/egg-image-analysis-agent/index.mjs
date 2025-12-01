import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const bedrock = new BedrockRuntimeClient({});
const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

// Tool definition for storing egg data
const tools = [
  {
    toolSpec: {
      name: 'store_egg_data',
      description: 'Save the analysis results for a single egg to the database. Call this tool once for EACH egg you identify in the image.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            color: { type: 'string', description: 'Shell color (white, cream, brown, dark brown, blue, green, olive, speckled)' },
            shape: { type: 'string', description: 'Egg shape (oval, round, elongated, pointed, asymmetric)' },
            size: { type: 'string', description: 'Relative size (small, medium, large, extra-large, jumbo)' },
            shellTexture: { type: 'string', description: 'Surface texture (smooth, rough, porous, bumpy, wrinkled, ridged)' },
            shellIntegrity: { type: 'string', description: 'Shell condition (intact, hairline crack, cracked, chipped, broken)' },
            hardness: { type: 'string', description: 'Shell hardness estimate (hard, normal, soft, thin)' },
            spotsMarkings: { type: 'string', description: 'Surface markings (none, light speckles, heavy speckles, calcium deposits)' },
            bloomCondition: { type: 'string', description: 'Protective coating status (present, partial, absent)' },
            cleanliness: { type: 'string', description: 'Cleanliness level (clean, slightly dirty, dirty, debris attached)' },
            visibleDefects: { type: 'array', items: { type: 'string' }, description: 'Array of visible defects' },
            overallGrade: { type: 'string', description: 'Quality grade (A, B, C, non-viable)' },
            notes: { type: 'string', description: 'Additional observations about this specific egg' }
          },
          required: ['color', 'shape', 'size', 'shellTexture', 'shellIntegrity', 'hardness', 'spotsMarkings', 'bloomCondition', 'cleanliness', 'visibleDefects', 'overallGrade', 'notes']
        }
      }
    }
  }
];

// Tool handler - saves egg record to DynamoDB
async function handleStoreEggData(toolInput, clutchId) {
  const eggId = randomUUID();
  const now = new Date().toISOString();

  const eggRecord = {
    pk: `CLUTCH#${clutchId}`,
    sk: `EGG#${eggId}`,
    id: eggId,
    clutchId,
    color: toolInput.color || 'unknown',
    shape: toolInput.shape || 'unknown',
    size: toolInput.size || 'unknown',
    shellTexture: toolInput.shellTexture || 'unknown',
    shellIntegrity: toolInput.shellIntegrity || 'unknown',
    hardness: toolInput.hardness || 'unknown',
    spotsMarkings: toolInput.spotsMarkings || 'none',
    bloomCondition: toolInput.bloomCondition || 'unknown',
    cleanliness: toolInput.cleanliness || 'unknown',
    visibleDefects: Array.isArray(toolInput.visibleDefects) ? toolInput.visibleDefects : [],
    overallGrade: toolInput.overallGrade || 'unknown',
    notes: toolInput.notes || '',
    createdAt: now
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: eggRecord }));
  console.log('Saved egg:', eggId, 'to clutch:', clutchId);
  return { success: true, eggId, message: `Egg ${eggId} saved successfully` };
}

// Create clutch metadata record
async function createClutchMetadata(clutchId, imageKey) {
  const now = new Date().toISOString();
  const clutchRecord = {
    pk: `CLUTCH#${clutchId}`,
    sk: 'METADATA',
    id: clutchId,
    uploadTimestamp: now,
    imageKey,
    createdAt: now,
    GSI1PK: 'CLUTCHES',
    GSI1SK: now
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: clutchRecord }));
  console.log('Created clutch metadata:', clutchId);
}

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  // Extract S3 info from EventBridge event
  const bucket = event.detail?.bucket?.name;
  const key = event.detail?.object?.key;

  if (!bucket || !key) {
    console.error('Missing bucket or key in event');
    return { statusCode: 400, body: 'Missing bucket or key' };
  }

  // Get image from S3
  const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const imageBytes = await s3Response.Body.transformToByteArray();
  const base64Image = Buffer.from(imageBytes).toString('base64');

  // Determine media type
  const ext = key.split('.').pop().toLowerCase();
  const mediaTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  const mediaType = mediaTypes[ext] || 'image/jpeg';

  // Create clutch for this image
  const clutchId = randomUUID();
  await createClutchMetadata(clutchId, key);

  // Run agent loop
  await runAgentLoop(base64Image, mediaType, clutchId);

  return { statusCode: 200, body: JSON.stringify({ clutchId }) };
};

async function runAgentLoop(base64Image, mediaType, clutchId) {
  const systemPrompt = `You are an expert poultry scientist analyzing an image of eggs. Your task is to:

1. Identify ALL eggs visible in the image
2. For EACH egg, assess its quality characteristics
3. Call the store_egg_data tool ONCE for EACH egg you identify

Quality dimensions to assess for each egg:
- color: Shell color (white, cream, brown, dark brown, blue, green, olive, speckled)
- shape: Overall shape (oval, round, elongated, pointed, asymmetric)
- size: Relative size (small, medium, large, extra-large, jumbo)
- shellTexture: Surface texture (smooth, rough, porous, bumpy, wrinkled, ridged)
- shellIntegrity: Structural condition (intact, hairline crack, cracked, chipped, broken)
- hardness: Estimated hardness based on appearance (hard, normal, soft, thin)
- spotsMarkings: Surface markings (none, light speckles, heavy speckles, calcium deposits)
- bloomCondition: Protective coating (present=matte, partial, absent=shiny)
- cleanliness: How clean (clean, slightly dirty, dirty, debris attached)
- visibleDefects: Array of any defects visible
- overallGrade: Quality grade (A=excellent, B=good, C=acceptable, non-viable)
- notes: Brief observations about this specific egg

IMPORTANT: Call store_egg_data for EVERY egg in the image, even if they look similar.`;

  const userMessage = 'Analyze this egg image carefully. Identify all eggs visible and assess each one. Then use the store_egg_data tool to save the results for each egg.';

  let messages = [{
    role: 'user',
    content: [
      { image: { format: mediaType.split('/')[1], source: { bytes: Buffer.from(base64Image, 'base64') } } },
      { text: userMessage }
    ]
  }];

  try {
    while (true) {
      const response = await bedrock.send(new ConverseCommand({
        modelId: 'amazon.nova-pro-v1:0',
        system: [{ text: systemPrompt }],
        messages,
        toolConfig: { tools }
      }));

      const assistantMessage = response.output.message;
      messages.push(assistantMessage);

      if (response.stopReason === 'tool_use') {
        const toolResults = [];
        for (const block of assistantMessage.content) {
          if (block.toolUse) {
            const { toolUseId, name, input } = block.toolUse;
            let result;
            if (name === 'store_egg_data') {
              result = await handleStoreEggData(input, clutchId);
              console.log('Tool executed:', name, 'for clutch:', clutchId);
            } else {
              result = { error: `Unknown tool: ${name}` };
            }
            toolResults.push({ toolResult: { toolUseId, content: [{ json: result }] } });
          }
        }
        messages.push({ role: 'user', content: toolResults });
      } else {
        break;
      }
    }
  } catch (err) {
    console.error('Agent loop error:', err);
  }
}
