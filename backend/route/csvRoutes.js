const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "../../media-log.csv");

router.get("/", (req, res) => {
  try {
    const csv = fs.readFileSync(csvPath, "utf8");
    res.set("Content-Type", "text/plain");
    res.send(csv);
  } catch (err) {
    console.error("Failed to read CSV:", err);
    res.status(500).send("Unable to read CSV file.");
  }
});

module.exports = router;
