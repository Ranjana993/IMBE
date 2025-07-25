const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../../media-log.csv");

if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, "Phone Number, Media ID, Media Type\n");
}

const webhookHandler = async (req, res) => {
  try {
    const message = req.body.messages?.[0];

    if (!message || !message.type || !message[message.type]) {
      // console.log("Invalid media format in message.");
      return res.status(200).json({ message: "OK" });
    }

    const mediaType = message.type;
    const mediaId = message[mediaType]?.id;
    const phoneNumber = message.from;

    if (!phoneNumber || !mediaId || !mediaType) {
      // console.log("Missing required fields in message.");
      return res.status(200).json({ message: "OK" });
    }

    const csvLine = `"${phoneNumber}",${mediaId},${mediaType}\n`;
    fs.appendFileSync(csvPath, csvLine, "utf8");
    console.log("Logged to CSV:", csvLine.trim());

    return res.status(200).json({ message: "OK" });
  } catch (err) {
    // console.error("Error handling webhook:", err.message);
    return res.status(200).json({ message: "OK" });
  }
};

module.exports = { webhookHandler };
