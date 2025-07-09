const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

class GmailAuth {
  constructor() {
    this.oauth2Client = null;
    this.credentials = null;
    this.tokens = null;
  }

  async initialize() {
    try {
      const credentialsPath = path.join(process.cwd(), 'credentials.json');
      const credentialsData = await fs.readFile(credentialsPath, 'utf8');
      this.credentials = JSON.parse(credentialsData);
      
      const { client_secret, client_id, redirect_uris } = this.credentials.web || this.credentials.installed;
      this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      try {
        const tokensPath = path.join(process.cwd(), 'tokens.json');
        const tokensData = await fs.readFile(tokensPath, 'utf8');
        this.tokens = JSON.parse(tokensData);
        this.oauth2Client.setCredentials(this.tokens);
        return true;
      } catch (error) {
        console.log('No existing tokens found');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Gmail auth:', error.message);
      return false;
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getAccessToken(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      this.tokens = tokens;
      
      const tokensPath = path.join(process.cwd(), 'tokens.json');
      await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));
      
      return tokens;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  isAuthenticated() {
    return this.oauth2Client && this.tokens;
  }

  getGmailClient() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async refreshTokenIfNeeded() {
    if (!this.oauth2Client || !this.tokens) {
      throw new Error('Not authenticated');
    }

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.tokens = { ...this.tokens, ...credentials };
      this.oauth2Client.setCredentials(this.tokens);
      
      const tokensPath = path.join(process.cwd(), 'tokens.json');
      await fs.writeFile(tokensPath, JSON.stringify(this.tokens, null, 2));
    } catch (error) {
      console.error('Failed to refresh token:', error.message);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.oauth2Client && this.tokens) {
        await this.oauth2Client.revokeCredentials();
      }
    } catch (error) {
      console.log('Error revoking credentials:', error.message);
    }

    this.tokens = null;
    this.oauth2Client.setCredentials({});
    
    try {
      const tokensPath = path.join(process.cwd(), 'tokens.json');
      await fs.unlink(tokensPath);
      console.log('Tokens file deleted');
    } catch (error) {
      console.log('No tokens file to delete');
    }
  }
}

module.exports = GmailAuth;