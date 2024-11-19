const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');

// Get all movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.render('movies/index', { movies });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Add a new movie
router.post('/add', async (req, res) => {
    const { title, director, year, genre, status } = req.body;
    try {
        const newMovie = new Movie({ title, director, year, genre, status });
        await newMovie.save();
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Update movie status
router.post('/update-status/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await Movie.findByIdAndUpdate(req.params.id, { status });
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Delete a movie
router.post('/delete/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
