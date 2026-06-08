// api/pixabay.js

export default async function handler(req, res) {
    // Get API key from Vercel environment variables
    const apiKey = process.env.PIXA_BAY_API;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'Pixabay API key not configured' });
    }

    // Get query parameters
    const { query, per_page = 8, image_type = 'video' } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Build Pixabay API URL
        const pixabayUrl = new URL('https://pixabay.com/api/videos/');
        pixabayUrl.searchParams.append('key', apiKey);
        pixabayUrl.searchParams.append('q', query);
        pixabayUrl.searchParams.append('per_page', per_page);
        pixabayUrl.searchParams.append('safesearch', 'true');

        const response = await fetch(pixabayUrl.toString(), {
            headers: {
                'User-Agent': 'ReelDeen/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Pixabay API error: ${response.status}`);
        }

        const data = await response.json();

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Cache for 1 hour
        res.setHeader('Cache-Control', 'public, max-age=3600');

        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Pixabay API error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch videos from Pixabay',
            message: error.message 
        });
    }
}
