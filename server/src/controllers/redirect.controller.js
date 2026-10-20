const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const redis = require('../config/redis');
const { extractClientIp, parseUserAgent, parseGeoLocation, parseReferrer } = require('../utils/analyticsHelper');

// Asynchronous non-blocking click tracker
const captureClickAsync = async (linkId, req) => {
  setImmediate(async () => {
    try {
      const ip = extractClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const referrerHeader = req.headers.referer || req.headers.referrer || '';

      const { browser, os, device } = parseUserAgent(userAgent);
      const { country, city } = parseGeoLocation(ip);
      const referrer = parseReferrer(referrerHeader);

      await Promise.all([
        prisma.click.create({
          data: {
            linkId,
            ip,
            country,
            city,
            browser,
            os,
            device,
            referrer,
          },
        }),
        prisma.link.update({
          where: { id: linkId },
          data: { totalClicks: { increment: 1 } },
        }),
      ]);
    } catch (err) {
      console.error('[Async Click Capture Error]:', err.message);
    }
  });
};

const handleRedirect = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check Redis cache first
    const cachedUrl = await redis.get(`link:${slug}`);
    if (cachedUrl) {
      // Find linkId from cache or fast query for analytics
      const linkMeta = await prisma.link.findUnique({
        where: { slug },
        select: { id: true, isActive: true, expiresAt: true, isPasswordProtected: true },
      });

      if (linkMeta && linkMeta.isActive) {
        if (linkMeta.expiresAt && new Date(linkMeta.expiresAt) < new Date()) {
          await redis.del(`link:${slug}`);
          return res.status(410).send(renderExpiredPage(slug));
        }

        if (!linkMeta.isPasswordProtected) {
          captureClickAsync(linkMeta.id, req);
          return res.redirect(302, cachedUrl);
        }
      }
    }

    // Direct Database lookup
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        originalUrl: true,
        slug: true,
        isActive: true,
        isPasswordProtected: true,
        expiresAt: true,
      },
    });

    if (!link) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.status(404).send(renderNotFoundPage(slug, clientUrl));
    }

    if (!link.isActive) {
      return res.status(403).send(renderInactivePage(slug));
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).send(renderExpiredPage(slug));
    }

    // Password Gate Check
    if (link.isPasswordProtected) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(302, `${clientUrl}/p/${slug}`);
    }

    // Warm Redis cache for fast subsequent visits
    await redis.set(`link:${slug}`, link.originalUrl, 'EX', 86400);

    // Asynchronously log analytics
    captureClickAsync(link.id, req);

    // Instant HTTP 302 Redirect
    return res.redirect(302, link.originalUrl);
  } catch (error) {
    next(error);
  }
};

const getGateInfo = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        isPasswordProtected: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (!link.isActive) {
      return res.status(403).json({ success: false, message: 'This link has been deactivated.' });
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired.' });
    }

    return res.status(200).json({
      success: true,
      slug: link.slug,
      title: link.title || 'Protected Link',
      isPasswordProtected: link.isPasswordProtected,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordAndUnlock = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        originalUrl: true,
        password: true,
        isActive: true,
        expiresAt: true,
        isPasswordProtected: true,
      },
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (!link.isActive) {
      return res.status(403).json({ success: false, message: 'This link has been deactivated.' });
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired.' });
    }

    if (!link.isPasswordProtected || !link.password) {
      captureClickAsync(link.id, req);
      return res.status(200).json({ success: true, destinationUrl: link.originalUrl });
    }

    const isMatch = await bcrypt.compare(password, link.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Access denied.' });
    }

    // Capture click upon verified unlock
    captureClickAsync(link.id, req);

    return res.status(200).json({
      success: true,
      message: 'Access granted!',
      destinationUrl: link.originalUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Fallback HTML response pages
function renderNotFoundPage(slug, clientUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Link Not Found — LinkPulse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 440px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        h1 { color: #f43f5e; margin-bottom: 0.5rem; font-size: 2rem; }
        p { color: #94a3b8; line-height: 1.5; margin-bottom: 1.5rem; }
        .badge { background: #1e293b; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-family: monospace; color: #38bdf8; }
        a { display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; }
        a:hover { background: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>404 Not Found</h1>
        <p>The shortened link <span class="badge">/${slug}</span> does not exist or has been removed.</p>
        <a href="${clientUrl}">Go to LinkPulse</a>
      </div>
    </body>
    </html>
  `;
}

function renderExpiredPage(slug) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Link Expired — LinkPulse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 440px; text-align: center; }
        h1 { color: #f59e0b; margin-bottom: 0.5rem; font-size: 2rem; }
        p { color: #94a3b8; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Link Expired</h1>
        <p>This shortened link (<strong>/${slug}</strong>) had an expiration date and is no longer accessible.</p>
      </div>
    </body>
    </html>
  `;
}

function renderInactivePage(slug) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Link Paused — LinkPulse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 1rem; max-width: 440px; text-align: center; }
        h1 { color: #64748b; margin-bottom: 0.5rem; font-size: 2rem; }
        p { color: #94a3b8; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Link Inactive</h1>
        <p>The owner of this link (<strong>/${slug}</strong>) has temporarily paused it.</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  handleRedirect,
  getGateInfo,
  verifyPasswordAndUnlock,
};
