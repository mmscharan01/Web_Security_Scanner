const express = require("express");
const router = express.Router();
const { scanWebsite } = require("../controllers/scanController");

router.post("/", scanWebsite);

module.exports = router;