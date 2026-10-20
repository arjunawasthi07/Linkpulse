const prisma = require('../config/db');
const redis = require('../config/redis');

const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalLinks, totalClicks, recentUsers, recentLinks] = await Promise.all([
      prisma.user.count(),
      prisma.link.count(),
      prisma.click.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.link.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, slug: true, title: true, originalUrl: true, totalClicks: true, createdAt: true },
      }),
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLinks,
        totalClicks,
        redisConnected: redis.isConnected(),
      },
      recentUsers,
      recentLinks: recentLinks.map((l) => ({ ...l, shortUrl: `${baseUrl}/${l.slug}` })),
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { links: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllLinks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { slug: { contains: search, mode: 'insensitive' } },
            { originalUrl: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.link.count({ where }),
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return res.status(200).json({
      success: true,
      links: links.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        originalUrl: l.originalUrl,
        shortUrl: `${baseUrl}/${l.slug}`,
        totalClicks: l.totalClicks,
        isActive: l.isActive,
        createdAt: l.createdAt,
        user: l.user,
      })),
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getAllLinks,
  deleteUser,
};
