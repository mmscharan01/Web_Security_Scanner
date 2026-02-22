import React, { useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Box, ThemeProvider, createTheme, CssBaseline, Switch, FormControlLabel } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function App() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [securityScore, setSecurityScore] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: '#1976d2' },
      background: {
        default: darkMode ? '#181a20' : '#f8fafc',
        paper: darkMode ? '#23272f' : '#fff',
      },
    },
    shape: { borderRadius: 12 },
  });

  const scanWebsite = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setSecurityScore(null);
    try {
      const res = await axios.post("http://localhost:5000/api/scan", { url });
      setReport(res.data);
      // Calculate security score (simple example: 100 - 20*issues)
      const totalChecks = 3; // X-Frame, X-Content-Type, CSP
      const missing = res.data.issues.length;
      let score = 100 - (missing / totalChecks) * 100;
      if (score < 0) score = 0;
      setSecurityScore(Math.round(score));
    } catch (err) {
      setError("Scan failed. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Security recommendations based on issues
  const recommendations = {
    "Missing X-Frame-Options header": "Add the X-Frame-Options header to prevent clickjacking attacks.",
    "Missing X-Content-Type-Options header": "Add the X-Content-Type-Options header to prevent MIME sniffing.",
    "Missing Content-Security-Policy header": "Add a Content-Security-Policy header to mitigate XSS and data injection attacks.",
    "Potential reflected XSS found": "Sanitize user input and use proper output encoding to prevent XSS."
  };

  // Pie chart data for vulnerabilities
  const pieData = [
    { name: 'Issues Found', value: report ? report.issues.length : 0 },
    { name: 'Secure Checks', value: report ? 3 - report.issues.length : 3 }
  ];
  const pieColors = [darkMode ? '#ef5350' : '#d32f2f', darkMode ? '#388e3c' : '#388e3c'];

  // Save scan history in localStorage
  React.useEffect(() => {
    if (report && url) {
      const prev = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      localStorage.setItem('scanHistory', JSON.stringify([
        { url, date: new Date().toLocaleString(), score: securityScore, issues: report.issues, https: report.https },
        ...prev.slice(0, 9)
      ]));
    }
  }, [report]);

  // Load scan history
  const [history, setHistory] = useState([]);
  React.useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('scanHistory') || '[]'));
  }, [report]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 8 }, mb: { xs: 2, sm: 8 }, background: darkMode ? '#23272f' : '#f8fafc', borderRadius: 3, boxShadow: 3, p: { xs: 1, sm: 4 } }}>
        <Box display="flex" justifyContent="flex-end" mb={1} gap={2}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="primary" />}
            label={darkMode ? "Dark Mode" : "Light Mode"}
            sx={{ color: darkMode ? '#fff' : '#222' }}
          />
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom align="center" sx={{ color: darkMode ? '#90caf9' : '#1976d2', letterSpacing: 1, fontSize: { xs: 28, sm: 36 } }}>
          Web Security Scanner
        </Typography>
        {/* Security Overview */}
        <Card sx={{ mb: 3, background: darkMode ? 'linear-gradient(90deg, #23272f 0%, #263238 100%)' : 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)', borderRadius: 2, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: darkMode ? '#90caf9' : '#1976d2', fontWeight: 600, fontSize: { xs: 16, sm: 20 } }}>Security Overview</Typography>
            <Typography variant="body1" sx={{ color: darkMode ? '#b0bec5' : '#333', mt: 1, fontSize: { xs: 13, sm: 16 } }}>
              Scan your website for common HTTP security headers and basic XSS issues. Get a quick security score and recommendations.
            </Typography>
          </CardContent>
        </Card>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <TextField
            fullWidth
            label="Website URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            sx={{ background: darkMode ? '#181a20' : '#fff', borderRadius: 1, input: { color: darkMode ? '#fff' : '#222' } }}
            InputLabelProps={{ style: { color: darkMode ? '#b0bec5' : undefined } }}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={scanWebsite}
            disabled={loading || !url}
            sx={{ minWidth: { xs: '100%', sm: 100 }, fontWeight: 600, boxShadow: 2, mt: { xs: 1, sm: 0 } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Scan'}
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {report && (
          <>
            {/* Pie Chart for Vulnerabilities */}
            <Card sx={{ mt: 3, mb: 3, borderRadius: 2, boxShadow: 2, background: darkMode ? '#181a20' : '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#90caf9' : '#1976d2', fontWeight: 600, fontSize: { xs: 15, sm: 18 } }}>
                  Security Check Overview
                </Typography>
                <Box sx={{ width: '100%', height: { xs: 180, sm: 220 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={window.innerWidth < 600 ? 50 : 70}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
            {/* Report Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 2, background: darkMode ? '#181a20' : '#fff' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: darkMode ? '#90caf9' : '#1976d2', fontWeight: 700, fontSize: { xs: 18, sm: 24 } }}>
                  Scan Report for {report.url}
                </Typography>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>HTTPS:</Typography>
                  <Typography variant="subtitle1" sx={{ color: report.https ? (darkMode ? '#66bb6a' : 'green') : (darkMode ? '#ef5350' : 'red'), fontWeight: 600 }}>
                    {report.https ? "Yes" : "No"}
                  </Typography>
                </Box>
                {/* Security Score */}
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Avg Security Score:</Typography>
                  <Box sx={{ background: securityScore >= 80 ? (darkMode ? '#388e3c' : '#c8e6c9') : securityScore >= 50 ? (darkMode ? '#fbc02d' : '#fff9c4') : (darkMode ? '#b71c1c' : '#ffcdd2'), color: darkMode ? '#fff' : '#222', px: 2, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: { xs: 15, sm: 18 } }}>
                    {securityScore !== null ? `${securityScore}/100` : "-"}
                  </Box>
                </Box>
                {/* Vulnerabilities Found */}
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>Vulnerabilities Found:</Typography>
                {report.issues.length === 0 ? (
                  <Alert severity="success" sx={{ my: 1 }}>No major issues found!</Alert>
                ) : (
                  <List>
                    {report.issues.map((issue, i) => (
                      <ListItem key={i} sx={{ background: darkMode ? '#2d2d34' : '#ffebee', borderRadius: 1, mb: 1, fontSize: { xs: 13, sm: 16 } }}>
                        <ListItemText primary={issue} primaryTypographyProps={{ color: 'error', fontWeight: 600 }} />
                      </ListItem>
                    ))}
                  </List>
                )}
                {/* Security Recommendations */}
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>Security Recommendations:</Typography>
                {report.issues.length === 0 ? (
                  <Alert severity="success" sx={{ my: 1 }}>Your site follows basic security best practices!</Alert>
                ) : (
                  <List>
                    {report.issues.map((issue, i) => (
                      <ListItem key={i} sx={{ background: darkMode ? '#263238' : '#e3f2fd', borderRadius: 1, mb: 1, fontSize: { xs: 13, sm: 16 } }}>
                        <ListItemText primary={recommendations[issue] || "Review this issue for best practices."} primaryTypographyProps={{ color: darkMode ? '#90caf9' : '#1976d2', fontWeight: 500 }} />
                      </ListItem>
                    ))}
                  </List>
                )}
                {/* Response Headers */}
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>Response Headers:</Typography>
                <Box component="pre" sx={{ background: darkMode ? '#23272f' : '#f5f5f5', p: 2, borderRadius: 1, fontSize: { xs: 11, sm: 13 }, overflow: 'auto', mt: 1, color: darkMode ? '#b0bec5' : '#222' }}>
                  {JSON.stringify(report.headers, null, 2)}
                </Box>
              </CardContent>
            </Card>
            {/* Scan History */}
            {history.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, background: darkMode ? '#181a20' : '#fff' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: darkMode ? '#90caf9' : '#1976d2', fontWeight: 600, mb: 1 }}>
                    Scan History (last 10)
                  </Typography>
                  <List>
                    {history.map((item, idx) => (
                      <ListItem key={idx} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 1, background: darkMode ? '#23272f' : '#f5f5f5', borderRadius: 1 }}>
                        <ListItemText
                          primary={<span style={{ fontWeight: 600 }}>{item.url}</span>}
                          secondary={<>
                            <span>Date: {item.date}</span><br />
                            <span>Score: <b>{item.score}/100</b></span><br />
                            <span>HTTPS: {item.https ? 'Yes' : 'No'}</span><br />
                            <span>Issues: {item.issues.length}</span>
                          </>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;