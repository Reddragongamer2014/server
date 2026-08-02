const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());

const CHANNEL_ID = process.env.CHANNEL_ID || "UCbb9WfRAITNLVYUuCar-VjQ";

app.get('/api/youtube', async (req, res) => {
    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        const response = await fetch(rssUrl);
        
        if (!response.ok) {
            throw new Error(`YouTube RSS request failed with status ${response.status}`);
        }

        const xmlText = await response.text();
        const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        
        const videos = entries.slice(0, 15).map(entry => {
            const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entry.match(/<title>(.*?)<\/title>/);

            const videoId = videoIdMatch ? videoIdMatch[1] : '';
            const title = titleMatch ? titleMatch[1] : '';

            return {
                title: title,
                videoId: videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                type: title.toLowerCase().includes('#shorts') ? 'short' : 'video'
            };
        });

        res.json({ success: true, videos });
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
module.exports.handler = serverless(app);
