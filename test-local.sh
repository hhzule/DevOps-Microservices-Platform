#!/bin/bash

echo "🚀 Starting Local Testing..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Start services
echo "Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 15

# Test API Health
echo "Testing API health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API Service is healthy${NC}"
else
    echo -e "${RED}✗ API Service failed${NC}"
fi

# Test Recommendation Health
echo "Testing Recommendation service health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Recommendation Service is healthy${NC}"
else
    echo -e "${RED}✗ Recommendation Service failed${NC}"
fi

# Test Frontend
echo "Testing Frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend failed${NC}"
fi

# Create test product
echo "Creating test product..."
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","price":99.99,"category":"Test","stock":10}' \
  > /dev/null 2>&1

# Get products
echo "Fetching products..."
PRODUCTS=$(curl -s http://localhost:3000/api/products)
if [ ! -z "$PRODUCTS" ]; then
    echo -e "${GREEN}✓ Products retrieved successfully${NC}"
else
    echo -e "${RED}✗ Failed to retrieve products${NC}"
fi

# Get recommendations
echo "Testing recommendations..."
RECS=$(curl -s http://localhost:5000/api/recommendations/user123)
if [ ! -z "$RECS" ]; then
    echo -e "${GREEN}✓ Recommendations working${NC}"
else
    echo -e "${RED}✗ Recommendations failed${NC}"
fi

echo ""
echo "✅ Local testing complete!"
echo "View logs with: docker-compose logs -f"
echo "Stop services with: docker-compose down"