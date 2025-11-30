---
inclusion: manual
---

# Don't Count Your Chickens: Product Definition

## The Problem That Doesn't Need Solving

People are counting their chickens before they hatch. This is a serious issue that has plagued humanity since the domestication of poultry. We need an AI-powered, event-driven, serverless solution to prevent premature chicken counting.

## The Solution: ChickenCounter™

An unnecessarily complex, event-driven choreography system that analyzes egg images, predicts viability, generates hypothetical chicken visualizations, and provides emotional support for eggs with low hatch probability.

## Core Features

### 1. Image Upload & Analysis
- User uploads image containing chicken eggs
- System extracts eggs from image using computer vision
- Each egg gets assigned a unique identifier and tracking number

### 2. Viability Assessment Pipeline
- AI agent analyzes each egg for:
  - Shell integrity
  - Size and shape consistency
  - Color patterns indicating health
  - Candling simulation (light penetration analysis)
- Outputs viability score: 0-100%

### 3. Hypothetical Chicken Generation
- For each viable egg (>30% viability), generate:
  - Breed prediction based on egg characteristics
  - 3D rendered chicken visualization
  - Personality traits (because why not)
  - Projected adult weight and egg-laying capacity

### 4. Emotional Support System
- **High Viability (70-100%)**: Congratulatory messages, upbeat music
- **Medium Viability (30-69%)**: Encouraging affirmations, motivational quotes
- **Low Viability (<30%)**: Custom-generated affirmation songs using AI
  - Lyrics about resilience and hope
  - Soothing melodies
  - Personalized to each egg's unique characteristics

### 5. Real-Time Dashboard
- Live viability scores
- Chicken visualization gallery
- Affirmation song player
- Event stream visualization (because we're using event-driven architecture)

## Event-Driven Choreography (Unnecessarily Complex)

### Event Flow Architecture

```
Image Upload
    ↓
[ImageUploadedEvent] → EventBridge
    ↓
    ├→ EggExtractionService (Lambda)
    │     ↓
    │  [EggsExtractedEvent] → EventBridge
    │     ↓
    │     ├→ ViabilityAnalysisService (Lambda)
    │     │     ↓
    │     │  [ViabilityAnalyzedEvent] → EventBridge
    │     │     ↓
    │     │     ├→ ChickenGeneratorService (Lambda) [if viability > 30%]
    │     │     │     ↓
    │     │     │  [ChickenGeneratedEvent] → EventBridge
    │     │     │     ↓
    │     │     │  DashboardUpdateService (Lambda)
    │     │     │
    │     │     ├→ AffirmationSongService (Lambda) [if viability < 30%]
    │     │     │     ↓
    │     │     │  [SongGeneratedEvent] → EventBridge
    │     │     │     ↓
    │     │     │  DashboardUpdateService (Lambda)
    │     │     │
    │     │     └→ NotificationService (Lambda)
    │     │           ↓
    │     │        [NotificationSentEvent] → EventBridge
    │     │
    │     └→ MetadataEnrichmentService (Lambda)
    │           ↓
    │        [MetadataEnrichedEvent] → EventBridge
    │
    └→ ImageStorageService (Lambda)
          ↓
       [ImageStoredEvent] → EventBridge
```

### Why Event-Driven Choreography?

Because we can. Also:
- **Scalability**: Each egg can be processed independently
- **Resilience**: If one service fails, others continue
- **Observability**: Every step generates events we can track
- **Complexity**: Makes the demo more impressive
- **Buzzwords**: Event-driven, serverless, microservices, choreography

## AWS Services Showcase

### Core Services
- **Amazon Bedrock**: AI agent for viability analysis, chicken generation, song lyrics
- **Amazon Rekognition**: Egg detection and extraction from images
- **EventBridge**: Event routing and choreography
- **Step Functions**: Orchestrate complex multi-step workflows (for song generation)
- **Lambda**: All the microservices
- **DynamoDB**: Store egg data, viability scores, chicken metadata
- **S3**: Store uploaded images and generated chicken visualizations
- **Polly**: Text-to-speech for affirmation songs

### Advanced Services (If Time Permits)
- **DynamoDB Streams**: Real-time dashboard updates
- **AppSync**: Real-time GraphQL subscriptions for live updates
- **CloudWatch Events**: Monitoring and alerting
- **X-Ray**: Distributed tracing of event flow

## Data Models

### Egg Record
```typescript
{
  eggId: string;
  uploadId: string;
  imageUrl: string;
  boundingBox: { x, y, width, height };
  viabilityScore: number; // 0-100
  viabilityFactors: {
    shellIntegrity: number;
    sizeConsistency: number;
    colorHealth: number;
    candlingScore: number;
  };
  status: 'analyzing' | 'viable' | 'low-viability' | 'complete';
  createdAt: string;
  updatedAt: string;
}
```

### Chicken Prediction
```typescript
{
  chickenId: string;
  eggId: string;
  breed: string;
  imageUrl: string; // Generated 3D render
  personality: string[];
  projectedWeight: number;
  eggLayingCapacity: number;
  confidence: number;
  createdAt: string;
}
```

### Affirmation Song
```typescript
{
  songId: string;
  eggId: string;
  lyrics: string;
  audioUrl: string; // Polly-generated audio
  mood: 'hopeful' | 'resilient' | 'comforting';
  duration: number;
  createdAt: string;
}
```

## User Experience Flow

1. **Upload**: User drags/drops image with eggs
2. **Processing**: Loading animation with event stream visualization
3. **Analysis**: Real-time viability scores appear as they're calculated
4. **Results**:
   - High viability eggs show chicken predictions
   - Low viability eggs get affirmation songs
   - Medium viability eggs get encouraging messages
5. **Dashboard**: Gallery view of all eggs with their outcomes

## Technical Implementation Notes

### Image Processing Pipeline
- Use Rekognition Custom Labels to detect eggs
- Extract each egg as separate image
- Store in S3 with metadata

### Viability Analysis
- Bedrock agent with custom prompt:
  - Analyze shell texture and color
  - Estimate age based on appearance
  - Simulate candling analysis
  - Output structured viability assessment

### Chicken Generation
- Bedrock agent generates breed prediction
- Use Stable Diffusion (via Bedrock) to generate chicken image
- Store in S3, return URL

### Affirmation Song Generation
- Bedrock generates personalized lyrics
- Polly converts to speech with SSML for musical quality
- Store audio in S3

### Event Choreography
- Every service publishes events to EventBridge
- Services subscribe to relevant events
- No direct service-to-service calls
- DynamoDB stores state, events drive transitions

## Demo Script

1. **Problem Introduction** (15s)
   - "People count chickens before they hatch. We're solving this."

2. **Upload Image** (15s)
   - Drag image with 6 eggs
   - Show event stream starting

3. **Watch Processing** (30s)
   - Events flowing through system
   - Viability scores appearing
   - Chickens being generated
   - Songs being created

4. **Show Results** (45s)
   - 3 high-viability eggs → chicken predictions
   - 2 medium-viability eggs → encouragement
   - 1 low-viability egg → play affirmation song

5. **Architecture Highlight** (15s)
   - Show EventBridge event flow
   - Mention all AWS services used

## Success Metrics

- **Eggs Analyzed**: Count of eggs processed
- **Chickens Generated**: Count of hypothetical chickens
- **Songs Created**: Count of affirmation songs
- **Average Viability**: Mean viability score
- **Event Throughput**: Events per second
- **End-to-End Latency**: Upload to complete results

## Why This Will Win

1. **Absurdly Complex**: Event-driven choreography for egg analysis
2. **Visually Impressive**: Real-time event flow, chicken renders, dashboard
3. **AI Showcase**: Bedrock for multiple use cases
4. **Serverless**: Pure Lambda + EventBridge architecture
5. **Hilarious**: Affirmation songs for sad eggs
6. **Complete**: End-to-end working demo
7. **Buzzword Complnt-driven, serverless, AI-powered, microservices

## Kiro Integration Story

- "Kiro generated all Lambda functions from event schemas"
- "Kiro helped design the event choreography architecture"
- "Kiro created the Bedrock agent prompts"
- "Built in 5 hours with Kiro assistance"

## Stretch Goals (If Ahead of Schedule)

- Real-time WebSocket updates for live event streaming
- Mobile-responsive design
- Egg history tracking (multiple uploads)
- Social sharing of chicken predictions
- Leaderboard of most viable eggs
- Email notifications when processing completes
- Export report as PDF

