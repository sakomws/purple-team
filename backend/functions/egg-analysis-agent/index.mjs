import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const bedrock = new BedrockRuntimeClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

// Tool definition for writing analysis results
const tools = [
  {
    toolSpec: {
      name: 'save_egg_analysis',
      description: 'Save the egg analysis results to the database. You MUST call this tool with your analysis findings.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            possibleHenBreeds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of up to 3 most likely chicken breeds that LAID this egg (the mother hen)'
            },
            predictedChickBreed: {
              type: 'string',
              description: 'Single predicted breed of the chick that will hatch from this egg'
            },
            breedConfidence: {
              type: 'string',
              enum: ['high', 'medium', 'low', 'uncertain'],
              description: 'Confidence level in breed predictions'
            },
            hatchLikelihood: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Percentage likelihood of successful hatching (0-100). THIS IS THE MOST IMPORTANT OUTPUT.'
            },
            chickenAppearance: {
              type: 'object',
              description: 'Predicted appearance of the chick that will hatch',
              properties: {
                plumageColor: { type: 'string' },
                combType: { type: 'string' },
                bodyType: { type: 'string' },
                featherPattern: { type: 'string' },
                legColor: { type: 'string' }
              },
              required: ['plumageColor', 'combType', 'bodyType', 'featherPattern', 'legColor']
            },
            notes: { type: 'string', description: 'Brief observations about the egg' }
          },
          required: ['possibleHenBreeds', 'predictedChickBreed', 'breedConfidence', 'hatchLikelihood', 'chickenAppearance', 'notes']
        }
      }
    }
  }
];

// Tool handler - updates the same EGG# record with analysis results
async function handleSaveEggAnalysis(toolInput, eggRecord, eggId) {
  const analysis = {
    ...toolInput,
    hatchLikelihood: Math.max(0, Math.min(100, toolInput.hatchLikelihood || 50))
  };

  // Update the same EGG# record with analysis data (triggers MODIFY event)
  const updatedRecord = {
    ...eggRecord,
    ...analysis,
    analysisTimestamp: new Date().toISOString()
  };

  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: updatedRecord
  }));

  return {
    success: true,
    message: `Analysis saved for egg ${eggId}`,
    hatchLikelihood: analysis.hatchLikelihood
  };
}

export const handler = async (event) => {
  for (const record of event.Records) {
    // Forwarder sends unmarshalled item directly as JSON
    const eggRecord = JSON.parse(record.body);
    const eggId = eggRecord.sk.replace('EGG#', '');

    await runAgentLoop(eggRecord, eggId);
  }

  return { statusCode: 200 };
};


async function runAgentLoop(eggRecord, eggId) {
  const systemPrompt = `You are an expert poultry scientist. Analyze egg characteristics and save your findings using the save_egg_analysis tool.

CRITICAL SCORING GUIDELINES for hatchLikelihood:
- Shell integrity: intact=90-100%, hairline crack=50-70%, cracked=10-30%, broken=0-10%
- Hardness: normal=good, soft/thin=reduce 20-30%
- Bloom condition: present=good, absent=reduce 10-20%
- Visible defects: each defect reduces by 10-15%
- Overall grade: A=+10%, B=0%, C=-10%, non-viable=max 20%

You MUST call the save_egg_analysis tool with your analysis.`;

  const userMessage = `Analyze this egg and save your analysis:
- Color: ${eggRecord.color || 'unknown'}
- Shape: ${eggRecord.shape || 'unknown'}
- Size: ${eggRecord.size || 'unknown'}
- Shell Texture: ${eggRecord.shellTexture || 'unknown'}
- Shell Integrity: ${eggRecord.shellIntegrity || 'unknown'}
- Hardness: ${eggRecord.hardness || 'unknown'}
- Spots/Markings: ${eggRecord.spotsMarkings || 'none'}
- Bloom Condition: ${eggRecord.bloomCondition || 'unknown'}
- Cleanliness: ${eggRecord.cleanliness || 'unknown'}
- Visible Defects: ${Array.isArray(eggRecord.visibleDefects) ? eggRecord.visibleDefects.join(', ') || 'none' : 'none'}
- Overall Grade: ${eggRecord.overallGrade || 'unknown'}`;

  let messages = [{ role: 'user', content: [{ text: userMessage }] }];

  try {
    // Agent loop - keep going until model stops requesting tools
    while (true) {
      const response = await bedrock.send(new ConverseCommand({
        modelId: 'amazon.nova-pro-v1:0',
        system: [{ text: systemPrompt }],
        messages,
        toolConfig: { tools }
      }));

      const assistantMessage = response.output.message;
      messages.push(assistantMessage);

      // Check if model wants to use tools
      if (response.stopReason === 'tool_use') {
        const toolResults = [];

        for (const block of assistantMessage.content) {
          if (block.toolUse) {
            const { toolUseId, name, input } = block.toolUse;

            let result;
            if (name === 'save_egg_analysis') {
              result = await handleSaveEggAnalysis(input, eggRecord, eggId);
              console.log('Tool executed:', name, 'Hatch likelihood:', input.hatchLikelihood);
            } else {
              result = { error: `Unknown tool: ${name}` };
            }

            toolResults.push({
              toolResult: {
                toolUseId,
                content: [{ json: result }]
              }
            });
          }
        }

        // Add tool results to conversation
        messages.push({ role: 'user', content: toolResults });
      } else {
        // Model finished (end_turn or stop_sequence)
        break;
      }
    }
  } catch (err) {
    console.error('Agent loop error:', err);
    // Fallback - save default analysis
    await handleSaveEggAnalysis({
      possibleHenBreeds: ['Unknown'],
      predictedChickBreed: 'Unknown',
      breedConfidence: 'uncertain',
      hatchLikelihood: 50,
      chickenAppearance: {
        plumageColor: 'unknown',
        combType: 'unknown',
        bodyType: 'unknown',
        featherPattern: 'unknown',
        legColor: 'unknown'
      },
      notes: 'Analysis failed - using defaults'
    }, eggRecord, eggId);
  }
}
