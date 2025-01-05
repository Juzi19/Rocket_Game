const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');
const crypto = require('crypto');
const path = require('path');
const uuid = require('uuid');
const Message = require('./Message');
require('dotenv').config();
const dbURI = process.env.MONGODB_URI;
const secret = process.env.SECRET;


//Mongo DB connect

//Mongo DB  Atlas-Verbindungs-URL
const mongoURI = dbURI;
const client = new MongoClient(mongoURI);

// Verbindung zur MongoDB herstellen
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('MongoDB connected!');
    } catch (err) {
        console.error('Fehler bei der Verbindung zu MongoDB:', err);
    }
}

//Stellt Verbindung mit der MongoDB Atlas Verbindungs URL her

mongoose.connect(mongoURI, {
    useNewUrlParser: true, //stellt sicher, dass die Verbindung stabil ist
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected!'))
.catch((error) => console.log('Error connecting to MongoDB Atlas:', error));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Statische Dateien aus dem Ordner "client" bereitstellen
app.use(express.static(path.join(__dirname, '../client')));
app.use(session({
    //have to change that one
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        saveUninitialized: false,
        maxAge: 24 * 60 * 60 * 1000,
    }
}))

//Initialized csrf token
app.use((req,res,next) => {
    if (!req.session.csrfToken) {
        console.log("CSRF TOKEN ERSTELLT");
        req.session.csrfToken = generateCsrfToken();
    }
    console.log(req.session.csrfToken);
    next();
});

/**
 * Generiert einen zufälligen CSRF-Token.
 * @returns {string} Der erzeugte CSRF-Token.
 */
function generateCsrfToken() {
    return crypto.randomBytes(64).toString('hex');
}

app.get('/csrf-token', (req,res)=>{
    if (!req.session.csrfToken) {
        // Nur generieren, wenn noch kein Token existiert
        req.session.csrfToken = generateCsrfToken();
        console.log("CSRF TOKEN ERSTELLT");
    }
    console.log('CSRF Token versendet', req.session.csrfToken);
    res.status(200).json({ csrfToken: req.session.csrfToken });
});

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname,'../client/index.html'));
})

app.get('/help', (req,res)=>{
    res.sendFile(path.join(__dirname,'../client/help.html'));
})

app.get('/leaderboard', (req,res)=>{
    res.sendFile(path.join(__dirname,'../client/leaderboard.html'));
})
app.get('/api/leaders', async (req,res)=>{
    try {
        const db = client.db('test'); // Ersetze durch den Namen deiner Datenbank
        const collection = db.collection('messages'); // Ersetze durch den Namen deiner Collection

        // Abfrage der Top-10-Einträge
        const topEntries = await collection
            .find()
            .sort({ coins: -1 })
            .limit(10)
            .toArray();

        res.status(200).json(topEntries); // JSON-Antwort zurückgeben
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
})
app.post('/send-profile', async(req, res)=>{
    const mycsrfToken = req.session.csrfToken;
    const formToken = req.body.csrfToken || req.headers['x-csrf-token'];

    console.log("CSRF Token erhalten: ", formToken)
    // Überprüfung des CSRF-Tokens
    if (mycsrfToken !== formToken) {
        return res.status(403).json({ error: 'Ungültiges CSRF-Token' });
    }
    let {name, coins} = req.body;
    let id = uuid.v6();

    name = xss(name);
    name = sanitizeHtml(name);
    coins = xss(coins);
    coins = sanitizeHtml(coins);

    coins = parseInt(coins, 10);

    console.log("Coins",coins,"Name", name,"ID", id)


    if (!name || (!coins && coins!=0) || !id){
        return res.status(400).json({error: 'Bitte alle Felder ausfüllen'});
    }
    try{
        const newMessage = new Message({coins, name, id});
        await newMessage.save();
        console.log('saved to mongo db');
        res.sendFile(path.join(__dirname, '../client/leaderboard.html'))
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: 'Fehler beim Senden der Mail/Message'});
    }

})


const PORT = process.env.PORT||5000;

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
    connectToMongoDB();
});