# Implementation Plan

- [x] 1. Create ConsolidateFindingsFunction Lambda





  - [x] 1.1 Create the Lambda function file with handler structure


    - Create `backend/functions/consolidate-findings/index.mjs`
    - Implement handler that extracts clutchId from EventBridge event
    - Add error handling for missing clutchId
    - _Requirements: 4.2, 4.3_

  - [x] 1.2 Implement DynamoDB query for clutch and eggs


    - Query using pk = "CLUTCH#{clutchId}" to get metadata and all eggs
    - Separate metadata record (sk = "METADATA") from egg records (sk begins with "EGG#")
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Implement egg count calculations


    - Calculate totalEggCount from eggs array length
    - Calculate viableEggCount by filtering eggs with hatchLikelihood >= 50
    - _Requirements: 1.3, 2.1_

  - [ ]* 1.4 Write property test for egg count calculations
    - **Property 1: Total egg count accuracy**
    - **Property 2: Viable egg count accuracy**
    - **Validates: Requirements 1.3, 2.1**

- [x] 2. Implement Nova Canvas image generation





  - [x] 2.1 Create prompt builder function


    - Build prompt with viable chicken count
    - Include chicken appearance details for each viable egg
    - Format: plumageColor, combType, bodyType, featherPattern, legColor, predictedBreed
    - _Requirements: 3.2, 3.3_

  - [ ]* 2.2 Write property test for prompt generation
    - **Property 4: Image prompt chicken count**
    - **Property 5: Image prompt appearance inclusion**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 2.3 Implement Nova Canvas API call


    - Use Bedrock InvokeModel with amazon.nova-canvas-v1:0
    - Handle API response and extract image bytes
    - Skip generation if viableEggCount is 0
    - _Requirements: 3.1, 3.5_

- [x] 3. Implement S3 storage and clutch update





  - [x] 3.1 Store generated image in S3


    - Upload image bytes to S3 bucket
    - Use key pattern: `clutches/{clutchId}/chickens.png`
    - _Requirements: 3.4_

  - [x] 3.2 Update clutch record with consolidation results

    - Update DynamoDB with totalEggCount, viableEggCount, chickenImageKey, consolidatedAt
    - Set chickenImageKey to null if no viable eggs
    - _Requirements: 2.2, 2.3_

  - [ ]* 3.3 Write property test for consolidation record
    - **Property 3: Consolidation record completeness**
    - **Validates: Requirements 2.2, 2.3**

- [x] 4. Add SAM template resources





  - [x] 4.1 Add ConsolidateFindingsFunction to template.yaml


    - Configure Lambda with nodejs22.x runtime
    - Add DynamoDB read/write permissions
    - Add Bedrock InvokeModel permission
    - Add S3 PutObject permission
    - _Requirements: 4.1_

  - [x] 4.2 Add EventBridge rule for "Consolidate Findings"

    - Create rule matching detail-type "Consolidate Findings"
    - Target the ConsolidateFindingsFunction
    - _Requirements: 4.1_

- [ ] 5. Checkpoint - Make sure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

