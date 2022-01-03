const express = require('express');
const router = express.Router();

router.get('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
});

router.post('/:board_id/write', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
})

router.get('/:board_id', async (req, res) => {
    const board_id = req.params.board_id;
    const board_type = req.query.board_type;
    const page = req.query.page;
});

module.exports = router;

