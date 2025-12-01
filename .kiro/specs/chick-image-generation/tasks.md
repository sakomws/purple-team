# Implementation Plan

- [x] 1. Update AnalysisResultForwarder filter to prevent re-triggering
  - [x] 1.1 Update SAM template FilterCriteria to check hatchLikelihood NOT in OldImage
    - Modify the filter pattern to include: `"OldImage": {"hatchLikelihood": [{"exists": false}]}`
    - This ensures we only trigger when hatchLikelihood is newly added, not on subsequent updates
    - _Requirements: 1.1, 1.2_

- [x] 2. Create ChickImageGenerator Lambda function
  - [x] 2.1 Add ChickImageGenerator Lambda to SAM template
    - Create Lambda function with SQS event source from AnalyzedEggQueue
    - Configure 60 second timeout and 1024 MB memory
    - Grant bedrock:InvokeModel permission for Nova Canvas
    - Grant s3:PutObject permission to ImageUploadBucket
    - Grant dynamodb:UpdateItem permission to DataTable
    - Add BUCKET_NAME environment variable
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 Implement ChickImageGenerator handler
    - Parse SQS message to extract egg record
    - Check if hatchLikelihood >= 70, skip if not
    - Extract predictedChickBreed and chickenAppearance
    - Build prompt for Nova Canvas
    - Call Nova Canvas to generate image
    - Decode base64 image and upload to S3 with key `chicks/{pk}/{eggId}.png`
    - Update DynamoDB record with chickImageUrl and chickImageGeneratedAt
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_
