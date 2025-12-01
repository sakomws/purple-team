# Requirements Document

## Introduction

This feature implements the final phase of clutch analysis: consolidating findings from all analyzed eggs within a clutch. When triggered by an EventBridge event with detail type "Consolidate Findings", the system queries the clutch to load all egg details, calculates aggregate statistics (total eggs, viable count), and generates a photorealistic image of all viable chickens as adults using Amazon Nova Canvas.

## Glossary

- **Clutch**: A group of eggs identified from a single uploaded image
- **Viable Egg**: An egg with a hatch likelihood above a threshold (typically 50%) indicating it will likely produce a healthy chick
- **Consolidation**: The process of aggregating egg analysis results and generating final clutch outputs
- **Nova Canvas**: Amazon Bedrock's image generation model used to create photorealistic chicken images
- **Findings Summary**: Aggregate data including total eggs, viable count, and predicted hatch outcomes

## Requirements

### Requirement 1

**User Story:** As a user, I want the system to automatically consolidate clutch findings when triggered, so that I can see the final analysis results for my egg batch.

#### Acceptance Criteria

1. WHEN an EventBridge event with detail type "Consolidate Findings" is received THEN the Consolidation_System SHALL query the clutch record and all associated eggs
2. WHEN querying clutch data THEN the Consolidation_System SHALL retrieve the clutch metadata and all egg records in a single DynamoDB query operation
3. WHEN clutch data is retrieved THEN the Consolidation_System SHALL calculate the total egg count from the query results

### Requirement 2

**User Story:** As a user, I want to know how many chickens will hatch from my clutch, so that I can plan for the new chicks.

#### Acceptance Criteria

1. WHEN calculating viability THEN the Consolidation_System SHALL count eggs with hatch likelihood greater than or equal to 50 percent as viable
2. WHEN consolidation completes THEN the Consolidation_System SHALL store the viable egg count in the clutch record
3. WHEN consolidation completes THEN the Consolidation_System SHALL store the total egg count in the clutch record

### Requirement 3

**User Story:** As a user, I want to see a photorealistic image of what my chickens will look like as adults, so that I can visualize my future flock.

#### Acceptance Criteria

1. WHEN viable eggs exist in the clutch THEN the Consolidation_System SHALL generate a photorealistic image using Nova Canvas
2. WHEN generating the chicken image THEN the Consolidation_System SHALL include one adult chicken for each viable egg
3. WHEN generating the chicken image THEN the Consolidation_System SHALL use the chicken appearance data from each viable egg analysis
4. WHEN the image is generated THEN the Consolidation_System SHALL store the image in S3 with a reference in the clutch record
5. IF no viable eggs exist in the clutch THEN the Consolidation_System SHALL skip image generation and store a null image reference

### Requirement 4

**User Story:** As a developer, I want the consolidation to be triggered by EventBridge, so that it integrates with the existing event-driven architecture.

#### Acceptance Criteria

1. WHEN an EventBridge rule matches detail type "Consolidate Findings" THEN the Consolidation_System SHALL invoke the consolidation Lambda function
2. WHEN the event is received THEN the Consolidation_System SHALL extract the clutch identifier from the event detail
3. IF the clutch identifier is missing from the event THEN the Consolidation_System SHALL log an error and terminate processing

