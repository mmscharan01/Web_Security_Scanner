const axios = require("axios");

const basicScan = async (url) => {
  let report = {
    url,
    https: url.startsWith("https"),
    headers: {},
    issues: []
  };

  try {
    const res = await axios.get(url);
    const headers = res.headers;
    report.headers = headers;

    if (!headers["x-frame-options"]) report.issues.push("Missing X-Frame-Options header");
    if (!headers["x-content-type-options"]) report.issues.push("Missing X-Content-Type-Options header");
    if (!headers["content-security-policy"]) report.issues.push("Missing Content-Security-Policy header");

    if (res.data.includes("<script>alert(")) report.issues.push("Potential reflected XSS found");

    return report;
  } catch (err) {
    throw new Error("Unable to reach target site");
  }
};

module.exports = { basicScan };