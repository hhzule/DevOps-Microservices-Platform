# DevOps-Microservices-Platform

### test locally:
docker --version
docker-compose --version
node --version
python3 --version

#### API service
cd services/api
npm install

sudo docker run -d -p 27017:27017 --name mongo-local mongo:6

sudo docker run -d -p 6379:6379 --name redis-local redis:7-alpine


//if containers already created run

sudo docker start mongo-local 
sudo docker start redis-local 

node server.js

curl http://localhost:3003/health


curl http://localhost:3003/api/products

curl -X POST http://localhost:3003/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100
  }'

curl http://localhost:3003/api/products

curl http://localhost:3003/metrics

<!-- claen up -->
sudo docker stop mongo-local redis-local
sudo docker rm mongo-local redis-local

#### Recommendation sevice

cd services/recommendation

python3 -m venv venv
source venv/bin/activate 

pip install -r requirements.txt

sudo docker run --name redis-local -p 6379:6379 -d redis:7-alpine

python app.py

curl http://localhost:5000/health

curl http://localhost:5000/api/recommendations/user123

<!-- clean up -->
deactivate
docker stop redis-local && docker rm redis-local

#### Full integration test with docker compose

cd /root folder

docker-compose build

docker-compose up || docker-compose up -d

docker-compose logs || docker-compose logs -f

<!-- specific service -->
docker-compose logs -f api
docker-compose logs -f recommendation
docker-compose logs -f frontend

//last 50
docker-compose logs --tail=50 api

docker-compose ps

<!-- Test API Endpoints -->
# Test API service health
curl http://localhost:3003/health
# Test Recommendation service health
curl http://localhost:5000/health
# Test Frontend (should return HTML)
curl http://localhost:80
# Get recommendations for a user
curl http://localhost:5000/api/recommendations/user123
# Test caching (second request should be faster)
time curl http://localhost:5000/api/recommendations/user123
time curl http://localhost:5000/api/recommendations/user123
# API metrics
curl http://localhost:3000/metrics
# Recommendation metrics
curl http://localhost:5000/metrics
# Connect to MongoDB container
docker exec -it devops-microservices-platform-mongodb-1 mongosh
# Inside MongoDB shell:
show dbs
use products
show collections
db.products.find().pretty()
exit

# Or as one-liner:
docker exec -it devops-microservices-platform-mongodb-1 mongosh --eval "db.getSiblingDB('products').products.find().pretty()"

# Connect to Redis container
docker exec -it devops-microservices-platform-redis-1 redis-cli
# Inside Redis CLI:
KEYS *
GET products:all
GET recommendations:user123
exit

# Or as one-liner:
docker exec -it devops-microservices-platform-redis-1 redis-cli KEYS "*"

# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Inspect specific container health
docker inspect devops-microservices-platform-api-1 | grep -A 10 Health

# View health check logs
docker inspect devops-microservices-platform-api-1 --format='{{json .State.Health}}' | jq


### Test Auto-scaling Behavior (Simulate Load)
# Monitor resource usage
docker stats

# In another terminal, generate load
while true; do curl -s http://localhost:3000/api/products > /dev/null; done

### Test Service Recovery
## Stop a service to test restart behavior
docker-compose stop api

## Try to access API
curl http://localhost:3000/health
## Expected: Connection refused

## Restart service
docker-compose start api

## Wait a few seconds and test again
sleep 5
curl http://localhost:3000/health
## Expected: Service responds again

# Clean Up
# Stop all services (containers keep data)
docker-compose stop

# Stop and remove containers (data persists in volumes)
docker-compose down

# Stop and remove everything including volumes (fresh start)
docker-compose down -v

# Remove images as well
docker-compose down -v --rmi all
# List all containers
docker ps -a

# Remove specific container
docker rm -f container_name_or_id

# Troubleshooting
# Error: "port is already allocated"

# Find what's using the port
# MacOS/Linux:
lsof -i :3000
# Windows:
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port

# Check Docker network
docker network ls
docker network inspect devops-microservices-platform_app-network

# Verify all services are on same network
docker-compose ps  

# Clear Docker build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile for errors
docker-compose config

# Check logs for error messages
docker-compose logs api

# Run container interactively to debug
docker-compose run api sh

# Wait for MongoDB to be ready
docker-compose logs mongodb

# Verify MongoDB is accessible
docker exec -it devops-microservices-platform-mongodb-1 mongosh --eval "db.runCommand({ ping: 1 })"

# Run test-local.sh
chmod +x test-local.sh
./test-local.sh