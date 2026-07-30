const express = require('express');
const serverless = require('serverless-http');
const app = express();

app.use(express.json());

// Pull credentials securely from Netlify Environment Variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

// --- API ENDPOINT FOR FRONTEND ---
app.get('/api/youtube', async (req, res) => {
    if (!YOUTUBE_API_KEY || !CHANNEL_ID) {
        return res.status(500).json({
            success: false,
            message: "Missing YOUTUBE_API_KEY or CHANNEL_ID in Netlify settings."
        });
    }

    try {
        // Fetch the 15 latest videos from your YouTube channel
        const fetchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video`;
        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (!data.items) {
            return res.status(400).json({ 
                success: false, 
                message: "Failed to pull videos from YouTube API." 
            });
        }

        // Format items specifically for your frontend JS script
        const videos = data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url,
            type: item.snippet.title.toLowerCase().includes('#shorts') ? 'short' : 'video'
        }));

        res.json({ success: true, videos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Wrap Express app for Netlify Serverless Functions
module.exports.handler = serverless(app);