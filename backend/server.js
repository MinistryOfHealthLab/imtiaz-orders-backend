const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'imtiaz_orders_db';
const COLLECTION_NAME = 'orders';

let db;
let ordersCollection;
let mongoConnected = false;

async function connectMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000 
    });
    await client.connect();
    db = client.db(DB_NAME);
    ordersCollection = db.collection(COLLECTION_NAME);
    mongoConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('⚠️ MongoDB Connection Error:', error.message);
    mongoConnected = false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    mongodb: mongoConnected ? 'Connected' : 'Disconnected'
  });
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  if (!mongoConnected) {
    return res.status(503).json({ success: false, error: 'MongoDB not connected' });
  }
  try {
    const orders = await ordersCollection.find({}).toArray();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Save order
app.post('/api/save', async (req, res) => {
  if (!mongoConnected) {
    return res.status(503).json({ success: false, error: 'MongoDB not connected' });
  }
  try {
    const orderData = req.body;
    const uniqueField = 'الرقم الشخصي';
    
    if (!orderData[uniqueField]) {
      return res.status(400).json({ success: false, error: 'الرقم الشخصي is required' });
    }

    const existing = await ordersCollection.findOne({ [uniqueField]: orderData[uniqueField] });

    if (existing) {
      await ordersCollection.updateOne(
        { _id: existing._id },
        { $set: { ...orderData, updatedAt: new Date() } }
      );
      res.json({ success: true, message: 'Order updated', id: existing._id });
    } else {
      const result = await ordersCollection.insertOne({
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      res.json({ success: true, message: 'Order saved', id: result.insertedId });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
  if (!mongoConnected) {
    return res.status(503).json({ success: false, error: 'MongoDB not connected' });
  }
  try {
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Order deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Update order
app.put('/api/orders/:id', async (req, res) => {
  if (!mongoConnected) {
    return res.status(503).json({ success: false, error: 'MongoDB not connected' });
  }
  try {
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to MongoDB on startup
connectMongoDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
