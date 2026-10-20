const geoip = require('geoip-lite');
const { UAParser } = require('ua-parser-js');

const extractClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || '127.0.0.1';
};

const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown';
  const os = result.os.name || 'Unknown';
  
  let device = 'Desktop';
  if (result.device.type === 'mobile') {
    device = 'Mobile';
  } else if (result.device.type === 'tablet') {
    device = 'Tablet';
  } else if (result.device.type === 'smarttv') {
    device = 'Smart TV';
  }

  return { browser, os, device };
};

const parseGeoLocation = (ip) => {
  // If local / private IP
  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  ) {
    return { country: 'Localhost', city: 'Local Network' };
  }

  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
      };
    }
  } catch (error) {
    console.warn('[GeoIP] Lookup failed:', error.message);
  }

  return { country: 'Unknown', city: 'Unknown' };
};

const parseReferrer = (referrerHeader) => {
  if (!referrerHeader || typeof referrerHeader !== 'string') {
    return 'Direct';
  }

  try {
    const url = new URL(referrerHeader);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('google.')) return 'Google';
    if (hostname.includes('twitter.') || hostname.includes('t.co') || hostname.includes('x.com')) return 'X / Twitter';
    if (hostname.includes('linkedin.')) return 'LinkedIn';
    if (hostname.includes('facebook.')) return 'Facebook';
    if (hostname.includes('instagram.')) return 'Instagram';
    if (hostname.includes('reddit.')) return 'Reddit';
    if (hostname.includes('youtube.')) return 'YouTube';
    if (hostname.includes('github.')) return 'GitHub';
    if (hostname.includes('tiktok.')) return 'TikTok';
    if (hostname.includes('bing.')) return 'Bing';

    return hostname.replace(/^www\./, '');
  } catch {
    return 'Other';
  }
};

module.exports = {
  extractClientIp,
  parseUserAgent,
  parseGeoLocation,
  parseReferrer,
};
