export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('imtiaz_orders_db');
    const collection = db.collection('orders');
    const orderData = req.body;
    const uniqueField = 'الرقم الشخصي';
    
    if (!orderData[uniqueField]) {
      await client.close();
      return res.status(400).json({ success: false, error: 'الرقم الشخصي is required' });
    }

    const existing = await collection.findOne({ [uniqueField]: orderData[uniqueField] });

    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        { $set: { ...orderData, updatedAt: new Date() } }
      );
      await client.close();
      return res.status(200).json({ success: true, message: 'Order updated', id: existing._id });
    } else {
      const result = await collection.insertOne({
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await client.close();
      return res.status(200).json({ success: true, message: 'Order saved', id: result.insertedId });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
