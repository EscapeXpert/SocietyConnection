const express = require('express');
const router = express.Router();

router.get('/write', async(req, res)=>{
   const target_nickname = req.query.target_nickname;
});

router.post('/write', async(req, res) => {
   const target_nickname = req.body.target_nickname;
   const message = req.body.message;
});

router.get('/', async(req, res) => {
   const nickname = req.query.nickname;
   const page = req.query.page;
});

module.exports = router;