const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../../media-log.csv");

if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, "Phone Number, Media ID, Media Type\n");
}

// Webhook endpoint
const webhookHandler = async (req, res) => {
  try {
    const message = req.body.messages?.[0];
    console.log("Webhook Message:", JSON.stringify(message, null, 2));

    if (!message || !message.type || !message[message.type]) {
      return res.status(400).send("No valid media found in the message.");
    }

    const mediaType = message.type;
    const mediaId = message[mediaType]?.id;
    const phoneNumber = message.from;

    if (!phoneNumber || !mediaId || !mediaType) {
      return res.status(400).send("Missing required fields");
    }

    const csvLine = `"${phoneNumber}",${mediaId},${mediaType}\n`;
    fs.appendFileSync(csvPath, csvLine, "utf8");
    console.log("Logged to csv:", csvLine.trim());

    res.status(200).send("Data saved successfully.");
  } catch (err) {
    console.error("Error handling webhook:", err);
    res.status(500).send("Internal server error.");
  }
};

module.exports = { webhookHandler };
