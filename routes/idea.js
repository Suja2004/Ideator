const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Load the Ideas model
require('../models/Idea');
const Ideas = mongoose.model('Ideas');


// Idea index page
router.get('/', (req, res) => {
    Ideas.find({})
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', { ideas: ideas });
        });
});


// Add idea form
router.get('/add', (req, res) => {
    res.render('ideas/add');
});

// Edit idea form
router.get('/edit/:id', (req, res) => {
    Ideas.findOne({
        _id: req.params.id
    })
        .then(idea => {
            res.render('ideas/edit', {
                idea: idea
            });
        });
});

// Process form (Add idea)
router.post('/', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add details' });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newIdea = {
            title: req.body.title,
            details: req.body.details
        };
        new Ideas(newIdea)
            .save()
            .then(idea => {
                req.flash('success_msg', 'Idea added');
                res.redirect('/ideas');
            });
    }
});

// Edit form process
router.put('/:id', (req, res) => {
    Ideas.findOne({
        _id: req.params.id
    })
        .then(idea => {
            let errors = [];
            if (!req.body.title) {
                errors.push({ text: 'Please add a title' });
            }
            if (!req.body.details) {
                errors.push({ text: 'Please add details' });
            }

            if (errors.length > 0) {
                res.render('ideas/edit', {
                    errors: errors,
                    idea: idea
                });
            } else {
                idea.title = req.body.title;
                idea.details = req.body.details;
                idea.save()
                    .then(updatedIdea => {
                        req.flash('success_msg', 'Idea updated');
                        res.redirect('/ideas');
                    });
            }
        });
});

// Delete Idea
router.delete('/:id', (req, res) => {
    Ideas.findByIdAndDelete(req.params.id)
        .then(() => {
            req.flash('success_msg', 'Idea Removed')
            res.redirect('/ideas');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Error deleting idea');
        });
});


module.exports = router;