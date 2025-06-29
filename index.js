const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/location-based-content', async (req, res) => {
    try {
        const clientIP =
            req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

        const ipToUse = (clientIP === '::1' || clientIP.startsWith('127'))
            ? '8.8.8.8'
            : clientIP;

        console.log("Client IP:", clientIP);
        console.log("Using IP for API:", ipToUse);

        // Wrap axios call in its own try-catch to see errors clearly
        let response;
        try {
            response = await axios.get(`https://ipapi.co/${ipToUse}/json/`);
            console.log("Response from ipapi:", response.data);
        } catch (apiError) {
            console.error("API call failed:", apiError.message);
            return res.status(500).json({ error: 'Failed to fetch location from ipapi' });
        }

        const { city, country_name } = response.data;

        let message = `Hello user from ${city || 'your city'}, ${country_name || 'your country'}`;
        if (country_name === 'India') message += ' 🇮🇳';
        else if (country_name === 'United States') message += ' 🇺🇸';

        res.json({ message, location: { city, country: country_name } });
    } catch (err) {
        console.error("Unexpected error:", err.message);
        res.status(500).json({ error: 'Something went wrong on the server.' });
    }
});

app.listen(PORT);
