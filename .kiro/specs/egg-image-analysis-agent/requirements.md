# Requirements Document

## Introduction

This feature implements an AI-powered image analysis agent that processes egg images uploaded to S3. When an image is uploaded, the agent uses Amazon Bedrock's vision capabilities to analyze the image, identify all visible eggs, assess their quality characteristics, and save the results to DynamoDB. The output data structure matches the schema required by the downstream egg-analysis-agent, enabling a seamless pipeline from image upload to breed prediction and hatch likelihood calculation.

## Glossary

- **Egg_Image_Analysis_Agent**: The Lambda function that processes S3 image uploads and uses Bedrock vision to analyze egg characteristics
- **Image_Upload_Bucket**: The S3 bucket that stores uploaded egg images and emits EventBridge notifications
- **Clutch**: A group of eggs from a single image upload, stored as a parent record in DynamoDB
- **Egg_Record**: A DynamoDB item containing physical characteristics of an individual egg detected in the image
- **Bedrock_Vision**: Amazon Bedrock's multimodal capability to analyze images using Amazon Nova models
- **Tool_Use**: Bedrock's function calling capability that allows the model to invoke defined tools to save data

## Requirements

### Requirement 1

**User Story:** As a poultry farm operator, I want the system to automatically process egg images when uploaded to S3, so that I can quickly analyze multiple eggs from a single photo.

#### Acceptance Criteria

1. WHEN an image is uploaded to the Image_Upload_Bucket THEN the Egg_Image_Analysis_Agent SHALL be triggered via EventBridge
2. WHEN the Egg_Image_Analysis_Agent is triggered THEN the system SHALL retrieve the image from S3 using the object key from the event
3. WHEN the image is retrieved THEN the Egg_Image_Analysis_Agent SHALL convert the image to base64 format for Bedrock processing

### Requirement 2

**User Story:** As a poultry farm operator, I want the agent to identify all eggs in an image and assess each one individually, so that I can get detailed analysis for every egg in a clutch.

#### Acceptance Criteria

1. WHEN the Egg_Image_Analysis_Agent processes an image THEN the system SHALL invoke Bedrock with vision capabilities to analyze the image
2. WHEN Bedrock analyzes the image THEN the system SHALL identify all visible eggs and assess each egg across quality dimensions: color, shape, size, shell texture, shell integrity, hardness, spot markings, bloom condition, cleanliness, visible defects, and overall grade
3. WHEN multiple eggs are detected THEN the Egg_Image_Analysis_Agent SHALL process each egg as a separate record

### Requirement 3

**User Story:** As a system integrator, I want the agent to use Bedrock tool calling to save egg data, so that the analysis results are reliably persisted to DynamoDB.

#### Acceptance Criteria

1. WHEN the Egg_Image_Analysis_Agent invokes Bedrock THEN the system SHALL provide a store_egg_data tool definition for saving analysis results
2. WHEN Bedrock identifies an egg THEN the model SHALL call the store_egg_data tool with the egg's characteristics
3. WHEN the store_egg_data tool is called THEN the Egg_Image_Analysis_Agent SHALL execute the tool and save the egg record to DynamoDB
4. WHEN multiple eggs are detected THEN Bedrock SHALL call the store_egg_data tool once for each egg

### Requirement 4

**User Story:** As a system integrator, I want egg records saved with the correct DynamoDB key structure, so that downstream processing can query eggs by clutch.

#### Acceptance Criteria

1. WHEN the first egg from an image is saved THEN the Egg_Image_Analysis_Agent SHALL create a Clutch metadata record with pk "CLUTCH#{clutchId}" and sk "METADATA"
2. WHEN an egg record is saved THEN the Egg_Image_Analysis_Agent SHALL use pk "CLUTCH#{clutchId}" and sk "EGG#{eggId}"
3. WHEN an egg record is saved THEN the record SHALL include all analyzed characteristics matching the egg-data-schema: color, shape, size, shellTexture, shellIntegrity, hardness, spotsMarkings, bloomCondition, cleanliness, visibleDefects, and overallGrade
4. WHEN the Clutch metadata is created THEN the record SHALL include GSI1PK "CLUTCHES" and GSI1SK set to the upload timestamp for listing queries

### Requirement 5

**User Story:** As a developer, I want the infrastructure properly configured with correct IAM permissions and event routing, so that the system operates securely and efficiently.

#### Acceptance Criteria

1. WHEN deploying the Egg_Image_Analysis_Agent THEN the SAM template SHALL configure an EventBridge rule to trigger on s3:ObjectCreated events from Image_Upload_Bucket
2. WHEN the Egg_Image_Analysis_Agent runs THEN the Lambda function SHALL have IAM permissions for s3:GetObject on the Image_Upload_Bucket
3. WHEN the Egg_Image_Analysis_Agent invokes Bedrock THEN the Lambda function SHALL have IAM permissions for bedrock:InvokeModel
4. WHEN the Egg_Image_Analysis_Agent saves records THEN the Lambda function SHALL have IAM permissions for dynamodb:PutItem on the DataTable
