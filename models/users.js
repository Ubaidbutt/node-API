'use strict';

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require ('passport-local-mongoose'); // username and password added automatically in User Schema

const userSchema = new Schema ({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin (passportLocalMongoose);

const Users = mongoose.model ('User', userSchema);

module.exports = Users;