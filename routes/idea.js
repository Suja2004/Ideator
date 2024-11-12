const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth')

// Load the Ideas model
require('../models/Idea');
const Ideas = mongoose.model('Ideas');


// Idea index page
router.get('/', ensureAuthenticated, (req, res) => {
    Ideas.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', { ideas: ideas });
        });
});


// Add idea form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Edit idea form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Ideas.findOne({
        _id: req.params.id
    })
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            }
            else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }
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
            details: req.body.details,
            user: req.user.id
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
router.delete('/:id', ensureAuthenticated, (req, res) => {
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