# Inbox Triage Assistant

A smart email management web application that uses intelligent clustering algorithms to automatically organize and group Gmail emails by type, sender, and topic. The app helps users quickly identify and manage similar emails in bulk, reducing inbox clutter and improving email productivity.

## Features

- **Gmail OAuth Integration** - Secure authentication with Gmail using OAuth2
- **Intelligent Email Clustering** - Advanced pattern recognition to group similar emails
- **Bulk Email Management** - Archive entire clusters of emails with one click
- **Real-time Email Analysis** - Processes up to 200 recent emails from the inbox
- **Responsive UI** - Clean, modern interface built with React and Tailwind CSS
- **Email Preview** - View email details including sender, subject, and read status
- **Cluster Statistics** - Shows email count, unread count, and date ranges

## Email Clustering Types

The application automatically groups emails into meaningful clusters:

- **Automated Messages** (no-reply, system emails)
- **Notifications** (alerts, reminders, mentions)
- **Newsletters** (marketing, promotional content)
- **Social Media** (updates from social platforms)
- **Shopping** (orders, receipts, shipping notifications)
- **Similar Topics** (emails with similar subject patterns)
- **Same Sender** (emails from the same domain)

## Technology Stack

### Frontend
- React 19.1.0
- Tailwind CSS 3.4.17
- Axios 1.10.0

### Backend
- Node.js with Express 5.1.0
- Google APIs 150.0.1
- OAuth2 authentication

## Setup

### Prerequisites

1. **Node.js and npm** installed
2. **Google Cloud Project** with Gmail API enabled
3. **OAuth2 Credentials** downloaded as `credentials.json`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Cloud Project:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth2 credentials for web application
   - Download credentials as `credentials.json` and place in project root

4. Configure OAuth2:
   - Add `http://localhost:3000` to authorized origins
   - Add `http://localhost:3001/auth/google/callback` to authorized redirect URIs

### Running the Application

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm start        # Frontend only (port 3000)
npm run server   # Backend only (port 3001)
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
inbox-triage-assistant/
├── public/                 # Static assets
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API communication
│   └── App.js              # Main application component
├── server/                 # Node.js backend
│   ├── auth/               # Authentication logic
│   ├── services/           # Business logic
│   └── server.js           # Express server setup
├── credentials.json        # Google API credentials (user-provided)
├── tokens.json            # OAuth tokens (auto-generated)
└── package.json           # Project dependencies
```

## Available Scripts

- `npm start` - Run React development server
- `npm run server` - Run Node.js backend server
- `npm run dev` - Run both frontend and backend concurrently
- `npm run build` - Build production React app
- `npm test` - Run tests

## Security

- OAuth2 tokens and credentials are stored locally and excluded from git
- No sensitive information is hardcoded in the source code
- Gmail API access uses read and modify permissions for email management

## License

This project is licensed under the MIT License.