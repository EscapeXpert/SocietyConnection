const express = require('express');
const router = express.Router();

router.post('/:post_id/delete', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.get('/:post_id/modify', async (req, res) => {
    const post_id = req.params.post_id;
    const board_type = req.query.board_type;
    const user_id = req.user.id;
});

router.post('/:post_id/modify', async (req, res) => {
    const post_id = req.params.post_id;
    const board_type = req.body.board_type;
    const title = req.body.title;
    const content = req.body.content;
    const user_id = req.user.id;
});

router.post('/:post_id/set_notice', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/unset_notice', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.get('/:post_id/apply', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
});

router.post('/:post_id/apply', async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.user.id;
})

router.get('/:post_id', async (req, res) => {
    const post_id = req.params.post_id;
    const board_type = req.query.board_type;
    const user_id = req.user.id;
});

module.exports = router;