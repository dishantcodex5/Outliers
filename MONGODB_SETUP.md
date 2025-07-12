# MongoDB Atlas Setup

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up for a free account
3. Create a new project

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select your preferred region
4. Name your cluster (e.g., "skillswap-cluster")

## Step 3: Set up Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password
4. Set privileges to "Read and write to any database"

## Step 4: Set up Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - **Note**: In production, restrict to specific IPs

## Step 5: Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Update .env File

Replace the MONGODB_URI in your `.env` file with your Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillswap?retryWrites=true&w=majority
```

Replace:

- `<username>` with your database username
- `<password>` with your database password
- `<cluster>` with your cluster name

## Step 7: Restart the Server

After updating the .env file, restart your development server:

```bash
npm run dev
```

The app should now connect to MongoDB Atlas successfully!
