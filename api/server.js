const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ministeroffice_db_user:jThwNNSU9yJtEe7L@m0freecluster.a5hduvj.mongodb.net/?appName=M0FreeCluster';
const DB_NAME = 'imtiaz_orders_db';
const COLLECTION_NAME = 'orders';

let db;
let ordersCollection;

async function connectMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    ordersCollection = db.collection(COLLECTION_NAME);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

// API Routes

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await ordersCollection.find({}).toArray();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Save new order or update existing
app.post('/api/save', async (req, res) => {
  try {
    const orderData = req.body;
    const uniqueField = 'الرقم الشخصي'; // National ID field
    
    if (!orderData[uniqueField]) {
      return res.status(400).json({ success: false, error: 'الرقم الشخصي is required' });
    }

    // Check if order with this national ID already exists
    const existing = await ordersCollection.findOne({ [uniqueField]: orderData[uniqueField] });

    if (existing) {
      // Update existing order
      const result = await ordersCollection.updateOne(
        { _id: existing._id },
        { $set: { ...orderData, updatedAt: new Date() } }
      );
      res.json({ success: true, message: 'Order updated', id: existing._id });
    } else {
      // Insert new order
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;

connectMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

module.exports = app;
