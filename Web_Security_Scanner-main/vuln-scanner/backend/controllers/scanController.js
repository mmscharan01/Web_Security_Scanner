const axios = require("axios");
const { basicScan } = require("../scanner/basicScanner");

const scanWebsite = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const report = await basicScan(url);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Scan failed", details: err.message });
  }
};

module.exports = { scanWebsite };