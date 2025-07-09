class EmailService {
  constructor(gmailAuth) {
    this.gmailAuth = gmailAuth;
    this.gmail = gmailAuth.getGmailClient();
  }

  async getRecentEmails(maxResults = 100) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: 'in:inbox -in:spam -in:trash',
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = await Promise.all(
        response.data.messages.map(async (message) => {
          const emailData = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          });

          const headers = emailData.data.payload.headers;
          const getHeader = (name) => {
            const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
            return header ? header.value : '';
          };

          return {
            id: message.id,
            threadId: emailData.data.threadId,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            isUnread: emailData.data.labelIds?.includes('UNREAD') || false,
            labels: emailData.data.labelIds || [],
          };
        })
      );

      return emails;
    } catch (error) {
      if (error.code === 401) {
        await this.gmailAuth.refreshTokenIfNeeded();
        this.gmail = this.gmailAuth.getGmailClient();
        return this.getRecentEmails(maxResults);
      }
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  async archiveEmails(emailIds) {
    try {
      const results = await Promise.all(
        emailIds.map(async (emailId) => {
          try {
            await this.gmail.users.messages.modify({
              userId: 'me',
              id: emailId,
              requestBody: {
                removeLabelIds: ['INBOX'],
              },
            });
            return { id: emailId, success: true };
          } catch (error) {
            console.error(`Failed to archive email ${emailId}:`, error.message);
            return { id: emailId, success: false, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: true,
        archivedCount: successful.length,
        failedCount: failed.length,
        results: results,
      };
    } catch (error) {
      if (error.code === 401) {
        await this.gmailAuth.refreshTokenIfNeeded();
        this.gmail = this.gmailAuth.getGmailClient();
        return this.archiveEmails(emailIds);
      }
      throw new Error(`Failed to archive emails: ${error.message}`);
    }
  }

  extractEmailDomain(email) {
    const match = email.match(/<(.+@.+)>/) || email.match(/(.+@.+)/);
    if (match) {
      const fullEmail = match[1];
      return fullEmail.split('@')[1];
    }
    return null;
  }

  extractSenderName(from) {
    const match = from.match(/^(.+?)\s*<.+>/);
    return match ? match[1].replace(/"/g, '').trim() : from.split('@')[0];
  }
}

module.exports = EmailService;