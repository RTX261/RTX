
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

// API endpoint for script search
app.get('/search-scripts', async (req, res) => {
    try {
        const query = req.query.q;
        const response = await axios.get(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&mode=free`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch scripts' });
    }
});

// تقديم الملفات الثابتة
app.use(express.static(__dirname));

// المسارات الرئيسية
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل الخادم
const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
