import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ministeroffice_db_user:jThwNNSU9yJtEe7L@m0freecluster.a5hduvj.mongodb.net/?appName=M0FreeCluster';
const DB_NAME = 'imtiaz_orders_db';
const COLLECTION_NAME = 'orders';

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orders = await connectDB();
    const orderData = req.body;
    const uniqueField = 'الرقم الشخصي';
    
    if (!orderData[uniqueField]) {
      return res.status(400).json({ success: false, error: 'الرقم الشخصي is required' });
    }

    const existing = await orders.findOne({ [uniqueField]: orderData[uniqueField] });

    if (existing) {
      await orders.updateOne(
        { _id: existing._id },
        { $set: { ...orderData, updatedAt: new Date() } }
      );
      return res.status(200).json({ success: true, message: 'Order updated', id: existing._id });
    } else {
      const result = await orders.insertOne({
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return res.status(200).json({ success: true, message: 'Order saved', id: result.insertedId });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
