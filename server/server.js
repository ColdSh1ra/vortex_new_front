// 1. IMPORTING MODULES (The "Tools")
const express = require('express'); // The framework to create our server
const cors = require('cors');       // Allows our React app (on port 3000) to talk to this server (on port 5000)
const fs = require('fs').promises;  // The File System module (promises version) to read/write our JSON files
const path = require('path');       // A tool to help us navigate folder paths correctly

const app = express();
const PORT = 5001;

// 2. MIDDLEWARE (The "Security & Processing" Gatekeepers)
app.use(cors());             // Allow cross-origin requests
app.use(express.json());     // Tells the server to recognize incoming data as JSON

// Path to our "Database"
const dataPath = path.join(__dirname, 'data', 'vortex.json');

// 3. THE ROUTES (The "Instructions")

/**
 * GET ROUTE: Fetches the content from siteData.json
 * This is what your React website will call to show text.
 */
app.get('/api/content', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        res.json(JSON.parse(data)); // Send the data back to the browser
    } catch (error) {
        res.status(500).json({ message: "Error reading data file" });
    }
});

/**
 * POST ROUTE: Updates the content in siteData.json
 * This is what your CRM will call when you click "Save Changes".
 */
app.post('/api/content', async (req, res) => {
    try {
        const newData = req.body; // The data sent from the React form
        
        // Write the new data back to the file
        // null, 2 makes the JSON file look "pretty" and readable
        await fs.writeFile(dataPath, JSON.stringify(newData, null, 2)); 
        
        res.json({ message: "Content updated successfully!", data: newData });
    } catch (error) {
        res.status(500).json({ message: "Error writing to data file" });
    }
});

// 4. START THE SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});