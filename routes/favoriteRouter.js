const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);

            }, (err) => next(err))
            .catch((err) => {
                next(err);
            });
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        let obj = {
            user: req.user._id,
            dishes: req.body
        }
        console.log(`Object: ${JSON.stringify(obj)}`);
        Favorites.findOne({user: req.user._id})
            .then ((favt) => {
                if (favt == null) {
                    Favorites.create(obj)
                    .then((dish) => {
                        console.log(`Dish successfully added as your favorite: \n${JSON.stringify(dish)}`);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, (err) => next(err))
                    .catch(err => next(err));
                } else {
                    console.log ('Else worked! ');
                    req.body.map (dish => {
                        console.log (`Dish: ${JSON.stringify (dish._id)}`);
                        if (favt.dishes.includes (dish._id) == false) {
                            console.log ('If works!');
                            favt.dishes.push (dish);
                        }
                    });
                    favt.save()
                        .then((favt) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favt);
                        })
                }
            })
            .catch ((err) => next (err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log (`UserID: ${req.user._id}`);
        Favorites.findOne({user: req.user._id})
            .then((favt) => {
                if (favt != null ) {
                    if (req.user._id.equals (favt.user)) {
                        console.log ('ID matches ');
                        for (let i = (favt.dishes.length - 1); i >= 0; i--) {
                            favt.dishes.pull({"_id": favt.dishes[i]._id});
                        }
                        favt.save()
                            .then((favt) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favt);
                            }, (err) => next(err));
                    } else {
                        err = new Error(`You are not authorized to delete this favorites.`);
                        err.status = 403;
                        next(err);
                    }
                } else {
                    err = new Error(`You are not authorized to delete this favorites.`);
                    err.status = 403;
                    next(err);
                }
            }, (err) => next(err))
            .catch(err => next(err));
    });


// Comments route //
favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.dishId}.`);
    })
    .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favt) => {
                if (favt == null) {
                    Favorites.create({
                        user: req.user._id,
                        dishes: [req.params.dishId]
                    })
                        .then((dish) => {
                            console.log(`Dish successfully added as your favorite: \n${JSON.stringify(dish)}`);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err))
                        .catch(err => next(err));
                } else {
                    if (favt.dishes.includes (req.params.dishId) == false) {
                        favt.dishes.push (req.params.dishId);
                        favt.save()
                            .then((favt) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favt);
                            }, (err) => next(err));
                    } else {
                        err = new Error(`This dish is already in your favorites. `);
                        err.status = 409;
                        next(err);
                    }
                }
            })
    })
    .put(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.dishId}.`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log (`UserID: ${req.user._id}`);
        Favorites.findOne({user: req.user._id})
            .then((favt) => {
                if (favt != null ) {
                    if (req.user._id.equals (favt.user)) {
                        console.log ('ID matches ');
                        if (favt.dishes.includes (req.params.dishId) == true) {
                            favt.dishes.pull({"_id": req.params.dishId});
                            favt.save()
                            .then((favt) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favt);
                            }, (err) => next(err));
                        } else {
                            err = new Error(`This comment is not in your favorites. You cannot delete it.`);
                            err.status = 403;
                            next(err);
                        }
                    } else {
                        err = new Error(`You are not authorized to delete this favorites.`);
                        err.status = 403;
                        next(err);
                    }
                } else {
                    err = new Error(`You are not authorized to delete this favorites.`);
                    err.status = 403;
                    next(err);
                }
            }, (err) => next(err))
            .catch(err => next(err));
    });


module.exports = favoriteRouter;