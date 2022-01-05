const express = require('express');
const router = express.Router();
const { sequelize, Message, User} = require('../models');
const {QueryTypes} = require('sequelize');

router.get('/write', async(req, res)=>{
   const user_id = "bcd";
   const target_nickname = "req.query.target_nickname";

   res.render("message_write", {
      target_nickname: target_nickname
   });
});

router.post('/write', async(req, res) => {
   const target_nickname = req.body.target_nickname;
   const message = req.body.message;
   //const user_id = req.user.id;
   // db에 연결
   console.log(message);
   console.log(target_nickname);
});

router.get('/send', async(req, res, next) => {
   const page = req.query.page;
   const user_id = "abc";
   try{
      const user = await User.findOne({
         attributes: ['nickname'],
         where: {id: user_id}
      });

      const message = await sequelize.query(`SELECT message, is_read, created_at, user.nickname FROM message LEFT JOIN user ON message.receiver_id = user.id WHERE message.sender_id = '${user_id}' ORDER BY created_at DESC`,{
         type: QueryTypes.SELECT
      });
      res.render("message_send", {
         title: user.nickname,
         messages: message
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

router.get('/receive', async(req, res, next) => {
   const page = req.query.page;
   const user_id = "bcd";
   try{
      const user = await User.findOne({
         attributes: ['nickname'],
         where: {id: user_id}
      });

      const message = await sequelize.query(`SELECT message, is_read, created_at, user.nickname FROM message LEFT JOIN user ON message.sender_id = user.id WHERE message.receiver_id = '${user_id}' ORDER BY created_at DESC`,{
          type: QueryTypes.SELECT
      });

      res.render("message_receive", {
         title: user.nickname,
         messages : message
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

module.exports = router;