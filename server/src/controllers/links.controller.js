const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const redis = require('../config/redis');
const { generateSlug, isValidCustomSlug, normalizeUrl } = require('../utils/slugGenerator');
const { generateQrCodeDataUrl } = require('../utils/qrHelper');

const createLink = async (req, res, next) => {
  try {
    const { originalUrl, customSlug, title, password, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Destination URL is required.',
      });
    }

    const cleanUrl = normalizeUrl(originalUrl);
    try {
      new URL(cleanUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL format.',
      });
    }

    let slug = '';
    if (customSlug) {
      const sanitized = customSlug.trim();
      if (!isValidCustomSlug(sanitized)) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias must be 3-30 characters (letters, numbers, hyphens, underscores) and not a reserved keyword.',
        });
      }

      // Check existence
      const exists = await prisma.link.findUnique({ where: { slug: sanitized } });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'This custom alias is already taken. Please choose another one.',
        });
      }
      slug = sanitized;
    } else {
      // Generate a collision-free slug
      let attempts = 0;
      while (attempts < 5) {
        const candidate = generateSlug(6);
        const exists = await prisma.link.findUnique({ where: { slug: candidate } });
        if (!exists) {
          slug = candidate;
          break;
        }
        attempts++;
      }
      if (!slug) {
        slug = generateSlug(8);
      }
    }

    // Handle password hashing if provided
    let hashedPassword = null;
    let isPasswordProtected = false;
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password.trim(), salt);
      isPasswordProtected = true;
    }

    // Expiration date parsing
    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry.getTime()) || parsedExpiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiration date must be a valid future timestamp.',
        });
      }
    }

    const newLink = await prisma.link.create({
      data: {
        originalUrl: cleanUrl,
        slug,
        title: title ? title.trim() : null,
        password: hashedPassword,
        isPasswordProtected,
        expiresAt: parsedExpiry,
        userId: req.user ? req.user.id : null,
      },
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${slug}`;

    // Warm Redis cache if NOT password protected and NOT expired
    if (!isPasswordProtected && !parsedExpiry) {
      await redis.set(`link:${slug}`, cleanUrl, 'EX', 86400); // 24hr cache
    }

    // Generate QR Code data URL
    let qrCode = null;
    try {
      qrCode = await generateQrCodeDataUrl(shortUrl);
    } catch (qrErr) {
      console.warn('QR Code generation notice:', qrErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Link shortened successfully!',
      link: {
        ...newLink,
        password: undefined, // Never expose password hash
        shortUrl,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserLinks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
      ...(search && {
        OR: [
          { slug: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { originalUrl: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: order.toLowerCase() === 'asc' ? 'asc' : 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          originalUrl: true,
          isPasswordProtected: true,
          isActive: true,
          expiresAt: true,
          totalClicks: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.link.count({ where }),
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enriched = links.map((link) => ({
      ...link,
      shortUrl: `${baseUrl}/${link.slug}`,
    }));

    return res.status(200).json({
      success: true,
      links: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLinkById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await prisma.link.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        originalUrl: true,
        isPasswordProtected: true,
        isActive: true,
        expiresAt: true,
        totalClicks: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found.',
      });
    }

    if (link.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this link.',
      });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${link.slug}`;
    const qrCode = await generateQrCodeDataUrl(shortUrl);

    return res.status(200).json({
      success: true,
      link: {
        ...link,
        shortUrl,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, originalUrl, isActive, expiresAt, password, removePassword } = req.body;

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title ? title.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (originalUrl) {
      const cleanUrl = normalizeUrl(originalUrl);
      new URL(cleanUrl);
      updateData.originalUrl = cleanUrl;
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (removePassword) {
      updateData.password = null;
      updateData.isPasswordProtected = false;
    } else if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password.trim(), salt);
      updateData.isPasswordProtected = true;
    }

    const updated = await prisma.link.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        slug: true,
        title: true,
        originalUrl: true,
        isPasswordProtected: true,
        isActive: true,
        expiresAt: true,
        totalClicks: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate Redis Cache
    await redis.del(`link:${link.slug}`);

    // If still active & no password, re-warm
    if (updated.isActive && !updated.isPasswordProtected && !updated.expiresAt) {
      await redis.set(`link:${updated.slug}`, updated.originalUrl, 'EX', 86400);
    }

    return res.status(200).json({
      success: true,
      message: 'Link updated successfully.',
      link: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await prisma.link.delete({ where: { id } });
    await redis.del(`link:${link.slug}`);

    return res.status(200).json({
      success: true,
      message: 'Link and associated analytics deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getQrCode = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const link = await prisma.link.findUnique({ where: { slug } });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${slug}`;
    const qrCode = await generateQrCodeDataUrl(shortUrl);

    return res.status(200).json({
      success: true,
      slug,
      shortUrl,
      qrCode,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLink,
  getUserLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getQrCode,
};
