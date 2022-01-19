const express = require('express');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const Board = require('../models/board');
const passport = require("passport");
const {Op} = require("sequelize");

const router = express.Router();

router.get('/', async (req, res) => {
    const BoardList = await Board.findAll({
        attributes: ['id','name']
    });
    res.render('main', {
        title: '메인' ,
        User: req.user,
        BoardList:BoardList
    });
});
module.exports = router;