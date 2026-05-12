import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ministeroffice_db_user:jThwNNSU9yJtEe7L@m0freecluster.a5hduvj.mongodb.net/?appName=M0FreeCluster';
const DB_NAME = 'imtiaz_orders_db';
const COLLECTION_NAME = 'orders';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Health check
    if (req.url === '/api/health') {
      return res.json({ success: true, message: 'Server running' });
    }

    // GET all orders
    if (req.method === 'GET' && req.url === '/api/orders') {
      const orders = await collection.find({}).toArray();
      return res.json({ success: true, count: orders.length, data: orders });
    }

    // POST new order
    if (req.method === 'POST' && req.url === '/api/save') {
      const orderData = req.body;
      const uniqueField = 'الرقم الشخصي';
      
      const existing = await collection.findOne({ [uniqueField]: orderData[uniqueField] });
      
      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          { $set: { ...orderData, updatedAt: new Date() } }
        );
        return res.json({ success: true, message: 'Updated', id: existing._id });
      } else {
        const result = await collection.insertOne({
          ...orderData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return res.json({ success: true, message: 'Saved', id: result.insertedId });
      }
    }

    // DELETE order
    if (req.method === 'DELETE' && req.url.includes('/api/orders/')) {
      const id = req.url.split('/api/orders/')[1];
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.json({ success: true, message: 'Deleted' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
