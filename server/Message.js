const mongoose = require('mongoose');
//Mongoose Schema für Kommunikation

const messageSchema = new mongoose.Schema({
    coins: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

//Eine Klasse, welche auf dem obigen Datenschema basiert um Daten zu speichern und abzurufen
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;