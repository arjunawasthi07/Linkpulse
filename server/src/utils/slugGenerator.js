const { customAlphabet } = require('nanoid');

// URL-safe characters, excluding confusing characters (0, O, I, l)
const alphabet = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

const generateSlug = (length = 6) => {
  const customGen = customAlphabet(alphabet, length);
  return customGen();
};

const isValidCustomSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  // Slug must be 3-30 chars, alphanumeric with hyphens or underscores
  const regex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!regex.test(slug)) return false;

  // Reserved paths that should never be used as link slugs
  const reservedSlugs = [
    'api', 'admin', 'auth', 'login', 'register', 'dashboard', 'analytics',
    'p', 'public', 'assets', 'favicon', 'health', 'metrics', 'privacy', 'terms'
  ];
  return !reservedSlugs.includes(slug.toLowerCase());
};

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
};

module.exports = {
  generateSlug,
  isValidCustomSlug,
  normalizeUrl,
};
