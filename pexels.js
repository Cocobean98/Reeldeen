// api/pexels.js
export default async function handler(req, res) {
  // 1. Get the secret key from Vercel Environment Variables
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    // 2. Make the request to Pexels from the SERVER
    const response = await fetch('https://api.pexels.com/videos/search?query=nature&orientation=portrait&per_page=15', {
      headers: {
        'Authorization': apiKey,
      },
    });

    const data = await response.json();

    // 3. Send the data back to your frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Pexels API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch videos from Pexels.' });
  }
}