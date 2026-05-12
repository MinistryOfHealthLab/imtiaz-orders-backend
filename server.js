const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://ministeroffice_db_user:jThwNNSU9yJtEe7L@m0freecluster.a5hduvj.mongodb.net/?appName=M0FreeCluster';

app.get('/api/health', (req, res) => res.json({ success: true }));

app.get('/api/orders', async (req, res) => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const orders = await client.db('imtiaz_orders_db').collection('orders').find({}).toArray();
    await client.close();
    res.json({ success: true, data: orders });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const col = client.db('imtiaz_orders_db').collection('orders');
    const result = await col.insertOne({ ...req.body, createdAt: new Date() });
    await client.close();
    res.json({ success: true, id: result.insertedId });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    await client.db('imtiaz_orders_db').collection('orders').deleteOne({ _id: new ObjectId(req.params.id) });
    await client.close();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3000, () => console.log('Running on 3000'));
