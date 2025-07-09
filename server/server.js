const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const GmailAuth = require('./auth/gmail');
const EmailService = require('./services/emailService');
const ClusteringService = require('./services/clusteringService');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const gmailAuth = new GmailAuth();
let emailService;
let clusteringService = new ClusteringService();

app.get('/api/auth/url', (req, res) => {
  try {
    const authUrl = gmailAuth.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code not found');
    }
    
    await gmailAuth.getAccessToken(code);
    emailService = new EmailService(gmailAuth);
    
    // Redirect back to the React app with success
    res.send(`
      <html>
        <body>
          <h2>✅ Gmail Connected Successfully!</h2>
          <p>You can now close this window and return to the app.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <html>
        <body>
          <h2>❌ Authentication Failed</h2>
          <p>Error: ${error.message}</p>
          <p>Please try again.</p>
        </body>
      </html>
    `);
  }
});

app.post('/api/auth/callback', async (req, res) => {
  try {
    const { code } = req.body;
    await gmailAuth.getAccessToken(code);
    emailService = new EmailService(gmailAuth);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: gmailAuth.isAuthenticated() });
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    await gmailAuth.logout();
    emailService = null;
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/emails/clusters', async (req, res) => {
  try {
    if (!gmailAuth.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const emails = await emailService.getRecentEmails(200);
    const clusters = clusteringService.clusterEmails(emails);
    
    res.json({ clusters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/emails/archive', async (req, res) => {
  try {
    if (!gmailAuth.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { emailIds } = req.body;
    const result = await emailService.archiveEmails(emailIds);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

gmailAuth.initialize().then((initialized) => {
  if (initialized && gmailAuth.isAuthenticated()) {
    emailService = new EmailService(gmailAuth);
    console.log('Gmail authentication initialized');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});