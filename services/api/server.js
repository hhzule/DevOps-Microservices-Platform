const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/products', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect();

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api', timestamp: new Date() });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Routes
app.get('/api/products', async (req, res) => {
  const start = Date.now();
  try {
    const cacheKey = 'products:all';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      httpRequestDuration.labels('GET', '/api/products', 200).observe((Date.now() - start) / 1000);
      return res.json(JSON.parse(cached));
    }

    const products = await Product.find();
    await redisClient.setEx(cacheKey, 300, JSON.stringify(products));
    
    httpRequestDuration.labels('GET', '/api/products', 200).observe((Date.now() - start) / 1000);
    res.json(products);
  } catch (error) {
    httpRequestDuration.labels('GET', '/api/products', 500).observe((Date.now() - start) / 1000);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await redisClient.del('products:all');
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});