import { MongoClient, ObjectId } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const orders = await connectDB();
    
    if (req.method === 'GET') {
      const data = await orders.find({}).toArray();
      return res.status(200).json({ success: true, count: data.length, data });
    }
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
