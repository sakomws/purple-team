#!/usr/bin/env python3

import boto3
import json
import uuid
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = 'hackathon-demo-DataTable-1GXOJ0HMUT9BJ'  # Update with your actual table name
table = dynamodb.Table(table_name)

def generate_clutch_data():
    """Generate sample clutch data with eggs"""
    
    clutches = []
    
    # Generate 5 sample clutches
    for i in range(5):
        clutch_id = f"clutch-{uuid.uuid4().hex[:8]}"
        upload_timestamp = (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
        
        # Clutch metadata
        clutch_metadata = {
            'pk': f'CLUTCH#{clutch_id}',
            'sk': 'METADATA',
            'GSI1PK': 'CLUTCHES',
            'GSI1SK': upload_timestamp,
            'id': clutch_id,
            'uploadTimestamp': upload_timestamp,
            'imageKey': f'clutches/{clutch_id}/original.jpg',
            'status': 'analyzed',
            'source': 'demo_data'
        }
        
        clutches.append(clutch_metadata)
        
        # Generate 3-8 eggs per clutch
        egg_count = random.randint(3, 8)
        
        for j in range(egg_count):
            egg_id = f"egg-{uuid.uuid4().hex[:6]}"
            
            # Generate realistic egg analysis data
            egg_data = {
                'pk': f'CLUTCH#{clutch_id}',
                'sk': f'EGG#{egg_id}',
                'id': egg_id,
                'hatchLikelihood': Decimal(str(round(random.uniform(65.0, 95.0), 1))),
                'possibleHenBreeds': random.choice([
                    ['Rhode Island Red', 'New Hampshire Red'],
                    ['Leghorn', 'Ancona'],
                    ['Plymouth Rock', 'Wyandotte'],
                    ['Orpington', 'Sussex'],
                    ['Ameraucana', 'Easter Egger']
                ]),
                'predictedChickBreed': random.choice([
                    'Rhode Island Red', 'Leghorn', 'Plymouth Rock', 
                    'Orpington', 'Ameraucana', 'Sussex'
                ]),
                'breedConfidence': random.choice(['high', 'medium', 'low']),
                'chickenAppearance': {
                    'plumageColor': random.choice([
                        'red-brown', 'white', 'black', 'buff', 'barred'
                    ]),
                    'combType': random.choice([
                        'single', 'rose', 'pea', 'walnut'
                    ]),
                    'bodyType': random.choice([
                        'large/heavy', 'medium', 'small/bantam'
                    ]),
                    'featherPattern': random.choice([
                        'solid', 'laced', 'barred', 'speckled'
                    ]),
                    'legColor': random.choice([
                        'yellow', 'slate', 'white', 'black'
                    ])
                },
                'eggAnalysis': {
                    'color': random.choice(['brown', 'white', 'cream', 'blue']),
                    'shape': random.choice(['oval', 'round', 'elongated']),
                    'size': random.choice(['medium', 'large', 'extra-large']),
                    'shellTexture': random.choice(['smooth', 'rough', 'porous']),
                    'shellIntegrity': 'intact',
                    'cleanliness': random.choice(['clean', 'slightly dirty']),
                    'overallGrade': random.choice(['A', 'B']),
                    'visibleDefects': []
                },
                'notes': f'High-quality egg from clutch {clutch_id}. Good development indicators.',
                'analysisTimestamp': upload_timestamp,
                'confidence': Decimal(str(round(random.uniform(0.85, 0.98), 2)))
            }
            
            clutches.append(egg_data)
    
    return clutches

def populate_data():
    """Populate DynamoDB with sample clutch data"""
    
    print("Generating sample clutch data...")
    clutch_data = generate_clutch_data()
    
    print(f"Inserting {len(clutch_data)} records into DynamoDB...")
    
    # Batch write to DynamoDB
    with table.batch_writer() as batch:
        for item in clutch_data:
            batch.put_item(Item=item)
            print(f"Inserted: {item['pk']} - {item['sk']}")
    
    print("✅ Sample clutch data populated successfully!")
    
    # Print summary
    clutches = [item for item in clutch_data if item['sk'] == 'METADATA']
    print(f"\n📊 Summary:")
    print(f"   • {len(clutches)} clutches created")
    print(f"   • {len(clutch_data) - len(clutches)} eggs analyzed")
    
    print(f"\n🔗 Test URLs:")
    print(f"   • List clutches: GET /clutches")
    for clutch in clutches[:3]:  # Show first 3
        print(f"   • Get clutch: GET /clutches/{clutch['id']}")

if __name__ == "__main__":
    populate_data()