const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const passport = require("passport");

const router = express.Router();

router.get('/', async (req, res) => {
    console.log(req.user);
    res.render('main', {
        title: '메인' ,
        User: req.user,
    });
});
module.exports = router;