import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

/* 🔑 TU CLIENT ID DE SOUNDCLOUD (SOLO AQUÍ) */
const SOUNDCLOUD_CLIENT_ID = 'lZRBFfF71uNn7HudznytkYqtBphJKWXz';

/* 🔍 SEARCH TRACKS */
app.get('/search', async (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const response = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(
        q
      )}&client_id=${SOUNDCLOUD_CLIENT_ID}&limit=30`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'SoundCloud error' });
    }

    const data = await response.json();
    res.json(data.collection || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ▶️ STREAM URL */
app.get('/stream/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const response = await fetch(
      `https://api.soundcloud.com/tracks/${id}?client_id=${SOUNDCLOUD_CLIENT_ID}`
    );
    const track = await response.json();

    res.json({
      streamUrl: `${track.stream_url}?client_id=${SOUNDCLOUD_CLIENT_ID}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Stream error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🎧 829 Music backend running on port ${PORT}`);
});
