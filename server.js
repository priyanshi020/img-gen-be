const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());


const uri = 'mongodb://localhost:27017/imgGen';
const client = new MongoClient(uri);

let promptsCollection;

// MongoDB connection
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('image_generation');
    promptsCollection = db.collection('prompts');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectDB();

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

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
