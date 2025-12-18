from flask import Flask, jsonify, request
import redis
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from prometheus_client import Counter, Histogram, generate_latest, REGISTRY
import time

app = Flask(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter('recommendation_requests_total', 'Total recommendation requests')
REQUEST_DURATION = Histogram('recommendation_request_duration_seconds', 'Request duration')

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'redis'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'recommendation'})

@app.route('/metrics')
def metrics():
    return generate_latest(REGISTRY)

@app.route('/api/recommendations/<user_id>')
@REQUEST_DURATION.time()
def get_recommendations(user_id):
    REQUEST_COUNT.inc()
    
    try:
        # Simulate recommendation algorithm
        cache_key = f'recommendations:{user_id}'
        cached = redis_client.get(cache_key)
        
        if cached:
            return jsonify(json.loads(cached))
        
        # Simple collaborative filtering simulation
        recommendations = {
            'user_id': user_id,
            'recommended_products': [
                {'id': 1, 'score': 0.95},
                {'id': 2, 'score': 0.87},
                {'id': 3, 'score': 0.82}
            ],
            'algorithm': 'collaborative_filtering',
            'timestamp': time.time()
        }
        
        redis_client.setex(cache_key, 600, json.dumps(recommendations))
        return jsonify(recommendations)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)