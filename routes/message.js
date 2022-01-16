const express = require('express');
const router = express.Router();
const { sequelize, Message, User} = require('../models');
const {QueryTypes} = require('sequelize');

router.get('/write', async(req, res, next)=>{
   const user_id = "psh3253";
   const target_nickname = req.query.target_nickname;
   try {
      res.render("message_write", {
         target_nickname: target_nickname
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

router.post('/write', async(req, res, next) => {
   const target_nickname = req.body.target_nickname;
   const title = req.body.title;
   const message = req.body.message;
   //const sender_id = req.user.id;
   const sender_id = "psh3253";
   try {
      const user = await User.findOne({
         attributes: ['id'],
         where: {
            nickname: target_nickname
         }
      });

      if(user == null){
         res.send('<script>alert("존재하지 않는 닉네임입니다."); history.back(); </script>');
      }
      else {
         await Message.create({
            receiver_id: user.id,
            title: title,
            message: message,
            sender_id: sender_id,
         });

         res.send("<script>window.opener.location.reload(); window.close();</script > ");
      }
   } catch(err){
      console.error(err);
      next(err);
   }
});

router.get('/send', async(req, res, next) => {
   const page = req.query.page || 1;
   const user_id = "psh3253";
   const start_message_number = page * 10 - 10;
   try{
      const user = await User.findOne({
         attributes: ['nickname'],
         where: {id: user_id}
      });

      const message_count = await Message.count({
         where: {
            sender_id: user_id,
            is_sender_delete: false,
         }
      });

      const message = await sequelize.query('SELECT message.id, message.title, message.message, message.is_read, message.created_at, user.nickname FROM `message` LEFT JOIN `user` ON message.receiver_id = user.id WHERE message.sender_id = `${user_id}` AND message.is_sender_delete = FALSE ORDER BY created_at DESC LIMIT ' + start_message_number.toString() + ', 10',{
         type: QueryTypes.SELECT
      });
      res.render("message_send", {
         title: user.nickname,
         messages: message,
         page: page,
         message_count: message_count
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

router.get('/receive', async(req, res, next) => {
   const page = req.query.page || 1;
   const filter = req.query.filter;
   const start_message_number = page * 10 - 10;

   console.log(filter);
   const user_id = "psh3253";
   try{
      const user = await User.findOne({
         attributes: ['nickname'],
         where: {id: user_id}
      });

      const message_count = await Message.count({
         where: {
            receiver_id: user_id,
            is_receiver_delete: false,
         }
      });

      const messages = await sequelize.query('SELECT message.id, message.message, message.title, message.is_read, message.created_at, user.nickname FROM `message` LEFT JOIN `user` ON message.sender_id = user.id WHERE message.receiver_id = `${user_id}` AND message.is_receiver_delete = FALSE ORDER BY created_at DESC LIMIT ' + start_message_number.toString() + ', 10',{
          type: QueryTypes.SELECT
      });

      res.render("message_receive", {
         title: user.nickname,
         messages : messages,
         filter: filter,
         page: page,
         message_count: message_count
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

router.post('/delete', async(req, res, next)=>{
   const message_ids = req.body.message_ids;
   const user_id = "psh3253";
   //const user_id = req.user.id;
   console.log(message_ids);
   try{
      for(let message_id of message_ids) {
         const message = await Message.findOne({
            attributes: ['sender_id', 'receiver_id', 'is_sender_delete', 'is_receiver_delete'],
            where: {id: message_id}
         });

         if (user_id === message.receiver_id && user_id === message.sender_id) {
            await Message.destroy({where: {id: message_id}});
            res.send('success');
         } else if (user_id === message.receiver_id) {
            await Message.update({is_receiver_delete: true}, {where: {id: message_id}});
            if (message.is_sender_delete === true)
               await Message.destroy({where: {id: message_id}});
            res.send('success');
         } else if (user_id === message.sender_id) {
            await Message.update({is_sender_delete: true}, {where: {id: message_id}});
            if (message.is_receiver_delete === true)
               await Message.destroy({where: {id: message_id}});
            res.send('success');
         } else {
            res.send('not creator');
         }
      }

   } catch(err){
      console.error(err);
      next(err);
   }
})

router.get('/:message_id', async(req, res, next)=>{
   const message_id = req.params.message_id;
   const type = req.query.type;
   // const user_id = req.user.id;
   const user_id = "psh3253";
   try{
      const message = await sequelize.query('SELECT * FROM `message` WHERE message.id = `${message_id}` AND (message.sender_id = `${user_id}` OR message.receiver_id = `${user_id}`)',{
         type: QueryTypes.SELECT
      });

      const sender_nickname = await User.findOne({
         attributes: ['nickname'],
         where: {id: message[0].sender_id}
      });

      await Message.update({is_read: true}, {
         where: {
            receiver_id: user_id,
            id: message_id
         }
      });
      res.render("message", {
         message: message[0],
         sender_nickname: sender_nickname.nickname,
         type: type
      });

   } catch(err){
      console.error(err);
      next(err);
   }
})

module.exports = router;