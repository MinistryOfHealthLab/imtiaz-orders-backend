# Imtiaz Orders Backend API

This is a Node.js Express backend for the Imtiaz Order Project that connects to MongoDB Atlas.

## Deployment to Vercel (FREE & EASIEST)

### Step 1: Create GitHub Account (if you don't have one)
- Go to https://github.com/signup
- Create a free account

### Step 2: Upload Backend to GitHub
1. Create a new repository on GitHub (Name: `imtiaz-orders-backend`)
2. Clone or upload the `backend` folder to this repository
3. Make sure these files are in the root:
   - `package.json`
   - `server.js`
   - `vercel.json`
   - `.env.example`

### Step 3: Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Click "Import Project"
4. Select your `imtiaz-orders-backend` repository
5. Vercel will auto-detect it's a Node.js project
6. Add Environment Variables:
   - Click "Environment Variables"
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://ministeroffice_db_user:jThwNNSU9yJtEe7L@m0freecluster.a5hduvj.mongodb.net/?appName=M0FreeCluster`
7. Click "Deploy"

### Step 4: Get Your Backend URL
After deployment completes, you'll see a URL like:
```
https://imtiaz-orders-backend.vercel.app
```

This is your API URL! Use it in your HTML.

---

## API Endpoints

### Get All Orders
```
GET https://your-url.vercel.app/api/orders
```

### Save/Update Order
```
POST https://your-url.vercel.app/api/save
Body: { order data as JSON }
```

### Delete Order
```
DELETE https://your-url.vercel.app/api/orders/:id
```

### Health Check
```
GET https://your-url.vercel.app/api/health
```

---

## Local Testing (Optional)

If you get permission to install Node.js later:

```bash
npm install
npm start
```

Then visit: `http://localhost:3000/api/health`
