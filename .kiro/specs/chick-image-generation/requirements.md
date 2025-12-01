# Requirements Document

## Introduction

This feature extends the egg analysis pipeline to generate realistic images of predicted chicks using Amazon Nova Canvas when eggs have a high likelihood of successful hatching. When an egg record is updated with analysis results indicating high viability (hatchLikelihood >= 70%), the system automatically generates a photorealistic image of the predicted chick based on breed and appearance characteristics, stores it in S3, and updates the DynamoDB record with the image location. This provides farmers with a visual preview of the expected chick.

## Glossary

- **Chick_Image_Generator**: The Lambda function that generates chick images using Amazon Nova Canvas and stores them in S3
- **Nova_Canvas**: Amazon's image generation model (amazon.nova-canvas-v1:0) capable of creating photorealistic images from text prompts
- **High_Hatch_Likelihood**: An egg record with hatchLikelihood >= 70%
- **Chick_Image_Bucket**: The S3 bucket where generated chick images are stored
- **Egg_Record**: A DynamoDB record with sk beginning with "EGG#" that gets updated with analysis results (hatchLikelihood, chickenAppearance, predictedChickBreed, etc.)
- **Chicken_Appearance**: The predicted visual characteristics of the chick (plumageColor, combType, bodyType, featherPattern, legColor)

## Requirements

### Requirement 1

**User Story:** As a poultry farm operator, I want chick images generated only for viable eggs, so that I can visualize what chicks will look like from eggs worth incubating.

#### Acceptance Criteria

1. WHEN an egg record is modified in DynamoDB with hatchLikelihood >= 70 THEN the Chick_Image_Generator SHALL be triggered to generate an image
2. WHEN an egg record has hatchLikelihood < 70 THEN the Chick_Image_Generator SHALL skip image generation for that record
3. WHEN the Chick_Image_Generator receives an egg record THEN the system SHALL extract chickenAppearance and predictedChickBreed from the record

### Requirement 2

**User Story:** As a poultry farm operator, I want realistic chick images generated based on breed characteristics, so that I can see an accurate preview of the expected chick.

#### Acceptance Criteria

1. WHEN generating a chick image THEN the Chick_Image_Generator SHALL construct a prompt using predictedChickBreed, plumageColor, combType, bodyType, featherPattern, and legColor
2. WHEN invoking Nova Canvas THEN the Chick_Image_Generator SHALL request a photorealistic image of a baby chick with the specified characteristics
3. WHEN Nova Canvas returns an image THEN the Chick_Image_Generator SHALL receive the image as base64-encoded data

### Requirement 3

**User Story:** As a system integrator, I want generated images stored in S3 with predictable paths, so that the frontend can easily retrieve and display them.

#### Acceptance Criteria

1. WHEN storing a chick image THEN the Chick_Image_Generator SHALL upload to S3 with key format "chicks/{pk}/{eggId}.png"
2. WHEN uploading to S3 THEN the Chick_Image_Generator SHALL set ContentType to "image/png"
3. WHEN the S3 upload completes THEN the Chick_Image_Generator SHALL construct the full S3 URI (s3://{bucket}/chicks/{pk}/{eggId}.png)

### Requirement 4

**User Story:** As a system integrator, I want the DynamoDB record updated with the image location, so that downstream systems can access the generated image.

#### Acceptance Criteria

1. WHEN the S3 upload completes successfully THEN the Chick_Image_Generator SHALL update the egg record with chickImageUrl field
2. WHEN updating the DynamoDB record THEN the Chick_Image_Generator SHALL preserve all existing fields and add chickImageUrl and chickImageGeneratedAt timestamp
3. WHEN the image generation completes THEN the system SHALL log the successful generation with eggId and S3 location

### Requirement 5

**User Story:** As a developer, I want the infrastructure properly configured with correct IAM permissions, so that the system operates securely.

#### Acceptance Criteria

1. WHEN deploying the Chick_Image_Generator THEN the SAM template SHALL grant bedrock:InvokeModel permission for amazon.nova-canvas-v1:0
2. WHEN deploying the Chick_Image_Generator THEN the SAM template SHALL grant s3:PutObject permission to the Chick_Image_Bucket
3. WHEN deploying the Chick_Image_Generator THEN the SAM template SHALL grant dynamodb:UpdateItem permission to the DataTable
4. WHEN configuring the DynamoDB stream event source THEN the SAM template SHALL use FilterCriteria to match MODIFY events on EGG# records where hatchLikelihood exists and is >= 70
