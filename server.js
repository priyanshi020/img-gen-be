const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Use the full MongoDB connection string
const uri = 'mongodb+srv://priyanshirathor19:IqVHV5PxQRFlRElf@cluster0.p2oqm3c.mongodb.net/image_generation?retryWrites=true&w=majority&ssl=true';

const client = new MongoClient(uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
});

let promptsCollection;
let connected = false;

// ✅ MongoDB connection
async function connectDB() {
  try {
    if (!connected) {
      await client.connect();
      const db = client.db('image_generation');
      promptsCollection = db.collection('prompts');
      connected = true;
      console.log('✅ Connected to MongoDB Atlas');
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
  }
}

connectDB();

// ✅ Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/400/300`;

    await promptsCollection.insertOne({
      prompt,
      imageUrl,
      createdAt: new Date(),
    });

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
