'use strict';

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
});

let Favorites = mongoose.model ('Favorite', favoriteSchema);
module.exports = Favorites;