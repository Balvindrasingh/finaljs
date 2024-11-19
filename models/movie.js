// models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: String,
    year: Number,
    genre: String,
    status: { 
        type: String, 
        enum: ['Watched', 'Plan to Watch', 'Never Finished'], 
        default: 'Plan to Watch' 
    }
});

module.exports = mongoose.model('Movie', MovieSchema);
