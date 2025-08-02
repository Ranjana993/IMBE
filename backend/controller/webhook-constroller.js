const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../../media-log.csv");

if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, "Phone Number,Media ID,Media Type\n");
}

const webhookHandler = async (req, res) => {
  try {
    const message = req.body.messages?.[0];

    if (!message || !message.type || !message[message.type]) {
      console.error(
        "Invalid media format in message:",
        JSON.stringify(req.body, null, 2)
      );
    } else {
      const mediaType = message.type;
      const mediaId = message[mediaType]?.id;
      const phoneNumber = message.from;

      if (!phoneNumber || !mediaId || !mediaType) {
        console.error("Missing required fields:", {
          phoneNumber,
          mediaId,
          mediaType,
        });
      } else {
        const csvLine = `"${phoneNumber}",${mediaId},${mediaType}\n`;

        try {
          fs.appendFileSync(csvPath, csvLine, "utf8");
          console.log("Logged to CSV:", csvLine.trim());
        } catch (fileErr) {
          console.error("Failed to write to CSV file:", fileErr);
        }
      }
    }
  } catch (err) {
    console.error("Error handling webhook:", err.message, err.stack);
  }

  return res.status(200).json({ message: "OK" });
};

module.exports = { webhookHandler };
