const express = require("express");
const router = express.Router();
const { webhookHandler } = require("../controller/webhook-constroller");

router.post("/", webhookHandler);

module.exports = router;
