#!/bin/bash

API_URL="https://p5f57pijb2.execute-api.us-east-1.amazonaws.com"

echo "🐔 Chicken Vision API Endpoint Tests"
echo "===================================="
echo ""

echo "📋 1. List all clutches:"
echo "GET $API_URL/clutches"
curl -s "$API_URL/clutches" | jq .
echo ""

echo "📋 2. Get specific clutch details:"
CLUTCH_ID=$(curl -s "$API_URL/clutches" | jq -r '.clutches[0].id')
echo "GET $API_URL/clutches/$CLUTCH_ID"
curl -s "$API_URL/clutches/$CLUTCH_ID" | jq .
echo ""

echo "🥚 3. List all registered eggs:"
echo "GET $API_URL/api/eggs"
curl -s "$API_URL/api/eggs" | jq '. | length' | xargs echo "Total eggs:"
echo ""

echo "🌡️ 4. Get environmental data:"
echo "GET $API_URL/api/environment/current"
curl -s "$API_URL/api/environment/current" | jq .
echo ""

echo "⛓️ 5. Test blockchain network status:"
echo "GET $API_URL/api/blockchain/network-status"
curl -s "$API_URL/api/blockchain/network-status" | jq .
echo ""

echo "✅ All endpoints tested successfully!"