class ClusteringService {
  constructor() {
    this.clusters = [];
  }

  clusterEmails(emails) {
    if (!emails || emails.length === 0) {
      return [];
    }

    const clusters = new Map();
    
    emails.forEach(email => {
      const clusterKey = this.determineClusterKey(email);
      
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          key: clusterKey,
          emails: [],
          type: this.getClusterType(clusterKey),
          name: this.getClusterName(clusterKey, email),
          description: this.getClusterDescription(clusterKey, email),
        });
      }
      
      clusters.get(clusterKey).emails.push(email);
    });

    return Array.from(clusters.values())
      .map(cluster => ({
        ...cluster,
        unreadCount: cluster.emails.filter(email => email.isUnread).length,
        emails: cluster.emails.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
      .filter(cluster => cluster.emails.length > 1)
      .sort((a, b) => b.emails.length - a.emails.length);
  }

  determineClusterKey(email) {
    const domain = this.extractDomain(email.from);
    const subject = this.normalizeSubject(email.subject);
    
    if (this.isAutomatedEmail(email)) {
      return `automated:${domain}`;
    }
    
    if (this.isNotificationEmail(email)) {
      return `notification:${domain}`;
    }
    
    if (this.isNewsletterEmail(email)) {
      return `newsletter:${domain}`;
    }
    
    if (this.isSocialMediaEmail(email)) {
      return `social:${domain}`;
    }
    
    if (this.isShoppingEmail(email)) {
      return `shopping:${domain}`;
    }
    
    if (this.hasCommonSubjectPattern(subject)) {
      return `subject:${this.getSubjectPattern(subject)}`;
    }
    
    return `domain:${domain}`;
  }

  getClusterType(clusterKey) {
    const [type] = clusterKey.split(':');
    const typeMap = {
      'automated': 'Automated',
      'notification': 'Notifications',
      'newsletter': 'Newsletters',
      'social': 'Social Media',
      'shopping': 'Shopping',
      'subject': 'Similar Topics',
      'domain': 'Same Sender',
    };
    return typeMap[type] || 'Mixed';
  }

  getClusterName(clusterKey, sampleEmail) {
    const [type, value] = clusterKey.split(':');
    
    switch (type) {
      case 'automated':
        return `${this.getDomainName(value)} Automated Messages`;
      case 'notification':
        return `${this.getDomainName(value)} Notifications`;
      case 'newsletter':
        return `${this.getDomainName(value)} Newsletter`;
      case 'social':
        return `${this.getDomainName(value)} Updates`;
      case 'shopping':
        return `${this.getDomainName(value)} Shopping`;
      case 'subject':
        return this.getSubjectPatternName(value);
      case 'domain':
        return `Emails from ${this.getDomainName(value)}`;
      default:
        return 'Email Group';
    }
  }

  getClusterDescription(clusterKey, sampleEmail) {
    const [type, value] = clusterKey.split(':');
    
    switch (type) {
      case 'automated':
        return `System-generated emails from ${this.getDomainName(value)}`;
      case 'notification':
        return `Notification emails from ${this.getDomainName(value)}`;
      case 'newsletter':
        return `Newsletter and promotional content from ${this.getDomainName(value)}`;
      case 'social':
        return `Social media updates and notifications from ${this.getDomainName(value)}`;
      case 'shopping':
        return `Shopping receipts, confirmations, and updates from ${this.getDomainName(value)}`;
      case 'subject':
        return `Emails with similar subject lines about ${value}`;
      case 'domain':
        return `All emails from the domain ${value}`;
      default:
        return 'A group of related emails';
    }
  }

  extractDomain(email) {
    const match = email.match(/<(.+@(.+))>/) || email.match(/(.+@(.+))/);
    return match ? match[match.length - 1].toLowerCase() : 'unknown';
  }

  getDomainName(domain) {
    if (!domain) return 'Unknown';
    
    const domainNames = {
      'gmail.com': 'Gmail',
      'outlook.com': 'Outlook',
      'yahoo.com': 'Yahoo',
      'hotmail.com': 'Hotmail',
      'github.com': 'GitHub',
      'linkedin.com': 'LinkedIn',
      'facebook.com': 'Facebook',
      'twitter.com': 'Twitter',
      'instagram.com': 'Instagram',
      'amazon.com': 'Amazon',
      'paypal.com': 'PayPal',
      'stripe.com': 'Stripe',
      'slack.com': 'Slack',
      'discord.com': 'Discord',
      'netflix.com': 'Netflix',
      'spotify.com': 'Spotify',
      'apple.com': 'Apple',
      'microsoft.com': 'Microsoft',
      'google.com': 'Google',
    };
    
    return domainNames[domain.toLowerCase()] || domain.replace(/^www\./, '');
  }

  normalizeSubject(subject) {
    if (!subject) return '';
    
    return subject
      .toLowerCase()
      .replace(/^(re|fwd?):\s*/i, '')
      .replace(/\[\w+\]/g, '')
      .replace(/\d+/g, '#')
      .trim();
  }

  isAutomatedEmail(email) {
    const automatedPatterns = [
      /no-?reply/i,
      /do-?not-?reply/i,
      /automated/i,
      /system/i,
      /daemon/i,
      /robot/i,
      /auto/i,
    ];
    
    return automatedPatterns.some(pattern => 
      pattern.test(email.from) || pattern.test(email.subject)
    );
  }

  isNotificationEmail(email) {
    const notificationPatterns = [
      /notification/i,
      /alert/i,
      /reminder/i,
      /update/i,
      /mentioned you/i,
      /tagged you/i,
      /commented/i,
      /liked your/i,
    ];
    
    return notificationPatterns.some(pattern => 
      pattern.test(email.subject) || pattern.test(email.from)
    );
  }

  isNewsletterEmail(email) {
    const newsletterPatterns = [
      /newsletter/i,
      /weekly digest/i,
      /daily digest/i,
      /unsubscribe/i,
      /marketing/i,
      /promotional/i,
      /deal/i,
      /offer/i,
      /sale/i,
    ];
    
    return newsletterPatterns.some(pattern => 
      pattern.test(email.subject) || pattern.test(email.from)
    );
  }

  isSocialMediaEmail(email) {
    const socialDomains = [
      'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
      'snapchat.com', 'tiktok.com', 'reddit.com', 'discord.com'
    ];
    
    const domain = this.extractDomain(email.from);
    return socialDomains.includes(domain.toLowerCase());
  }

  isShoppingEmail(email) {
    const shoppingPatterns = [
      /order/i,
      /receipt/i,
      /purchase/i,
      /payment/i,
      /invoice/i,
      /shipping/i,
      /delivered/i,
      /refund/i,
      /return/i,
    ];
    
    const shoppingDomains = [
      'amazon.com', 'ebay.com', 'paypal.com', 'stripe.com',
      'shopify.com', 'etsy.com', 'walmart.com', 'target.com'
    ];
    
    const domain = this.extractDomain(email.from);
    
    return shoppingPatterns.some(pattern => pattern.test(email.subject)) ||
           shoppingDomains.includes(domain.toLowerCase());
  }

  hasCommonSubjectPattern(subject) {
    const patterns = [
      /^weekly/i,
      /^daily/i,
      /^monthly/i,
      /report$/i,
      /summary$/i,
      /digest$/i,
      /update$/i,
    ];
    
    return patterns.some(pattern => pattern.test(subject)) && subject.length > 5;
  }

  getSubjectPattern(subject) {
    if (/weekly/i.test(subject)) return 'weekly reports';
    if (/daily/i.test(subject)) return 'daily updates';
    if (/monthly/i.test(subject)) return 'monthly summaries';
    if (/report/i.test(subject)) return 'reports';
    if (/summary/i.test(subject)) return 'summaries';
    if (/digest/i.test(subject)) return 'digests';
    if (/update/i.test(subject)) return 'updates';
    
    return subject.substring(0, 20);
  }

  getSubjectPatternName(pattern) {
    const patternNames = {
      'weekly reports': 'Weekly Reports',
      'daily updates': 'Daily Updates',
      'monthly summaries': 'Monthly Summaries',
      'reports': 'Reports',
      'summaries': 'Summaries',
      'digests': 'Digest Emails',
      'updates': 'Update Notifications',
    };
    
    return patternNames[pattern] || `${pattern.charAt(0).toUpperCase()}${pattern.slice(1)}`;
  }
}

module.exports = ClusteringService;