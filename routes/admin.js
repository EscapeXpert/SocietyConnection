const express = require('express');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const {Op} = require("sequelize");
const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
    if(req.user.grade!==5){
        return res.send('<script> alert("admin이 아닙니다.");window.location.replace("/");</script>');
    }
    const UserList = await User.findAll({
        where: { id: {
                [Op.not]: req.user.id
            }
        }
    });
    res.render('admin', {
        title: 'admin',
        UserList : UserList
    });
});





module.exports = router;