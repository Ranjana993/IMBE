// controllers/mediaController.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TURN_TOKEN = process.env.TURN_TOKEN;
const tempDir = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Downloads image from Turn.io API and saves to temp directory
 * @param {string} mediaId - The media ID from Turn.io
 * @returns {Promise<string>} Path to the downloaded file
 */
const downloadImage = async (mediaId) => {
  const filepath = path.join(tempDir, mediaId);
  const response = await axios({
    url: `https://whatsapp.turn.io/v1/media/${mediaId}`,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'Authorization': `Bearer ${TURN_TOKEN}`
    }
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath))
  });
};

/**
 * Forwards image to processing pipeline
 * @param {string} ref_id - Reference ID
 * @param {string} media_id - Media ID
 * @returns {Promise<void>}
 */
const forwardImageToProcess = async (ref_id, media_id) => {
  try {
    await downloadImage(media_id);
    // Add any additional processing logic here
  } catch (err) {
    console.error(`[Error] Image Download Failed: ${err}`);
    throw err;
  }
};

/**
 * Stream media directly to client
 */
const streamMedia = async (mediaId) => {
  try {
    const mediaRes = await axios.get(`https://whatsapp.turn.io/v1/media/${mediaId}`, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${TURN_TOKEN}`
      }
    });
    return {
      data: mediaRes.data,
      contentType: mediaRes.headers['content-type']
    };
  } catch (error) {
    console.error('Media fetch error:', error.response?.data || error.message);
    throw new Error('Failed to fetch media');
  }
};

/**
 * Handle receipt submission
 */
const submitReceipt = async (message_id, whatsapp_id, media_id) => {
  try {
    await forwardImageToProcess(message_id, media_id);
    return { message: "Receipt submitted for processing" };
  } catch (err) {
    console.error('Receipt submission error:', err);
    throw new Error('Failed to process receipt');
  }
};

module.exports = {
  downloadImage,
  forwardImageToProcess,
  streamMedia,
  submitReceipt
};