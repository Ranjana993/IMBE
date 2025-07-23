// routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const mediaController = require('../controller/media-controller');

/**
 * @route GET /api/media/:mediaId
 * @desc Stream media directly to client
 */
router.get('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { data, contentType } = await mediaController.streamMedia(mediaId);
    res.set('Content-Type', contentType);
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/media/submit
 * @desc Submit receipt for processing
 */
router.post('/submit', async (req, res) => {
  try {
    const { message_id, whatsapp_id, media_id } = req.body;
    const result = await mediaController.submitReceipt(message_id, whatsapp_id, media_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;