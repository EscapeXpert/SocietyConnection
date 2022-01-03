const express = require('express');
const router = express.Router();
const {Message} = require('../models');

router.get('/write', async(req, res)=>{
   const target_nickname = req.query.target_nickname;
   res.render("message", {});
});

router.post('/write', async(req, res) => {
   const target_nickname = req.body.target_nickname;
   const message = req.body.message;
   const user_id = req.user.id;
   // db에 연결
});

router.get('/send', async(req, res) => {
   const nickname = req.query.nickname;
   const page = req.query.page;
   const user_id = req.user.id;
});

router.get('/receive', async(req, res, next) => {
   const nickname = "bcd"
   //req.query.nickname;
   const page = req.query.page;
   const user_id = "abc";
   try{
      const message = await Message.findAll({
         where: {receiver_id: nickname},
         order: [['created_At', 'DESC']]
      });
      console.log(message)
      res.render("message", {
         title: nickname,
         messages : message
      });
   } catch(err){
      console.error(err);
      next(err);
   }
});

module.exports = router;