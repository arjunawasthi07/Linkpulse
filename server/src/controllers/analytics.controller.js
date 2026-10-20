const prisma = require('../config/db');

const getLinkAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { range = '30d' } = req.query;

    const link = await prisma.link.findUnique({
      where: { id },
      include: {
        _count: { select: { clicks: true } },
      },
    });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (link.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Determine date cutoff
    const now = new Date();
    let startDate = new Date();
    if (range === '24h') {
      startDate.setHours(now.getHours() - 24);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Fetch clicks within the range
    const clicks = await prisma.click.findMany({
      where: {
        linkId: id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Unique visitors by IP
    const uniqueIps = new Set(clicks.map((c) => c.ip).filter(Boolean));

    // Aggregate by Day / Hour
    const timelineMap = {};
    clicks.forEach((click) => {
      let key;
      const date = new Date(click.timestamp);
      if (range === '24h') {
        key = `${date.getHours()}:00`;
      } else {
        key = date.toISOString().split('T')[0];
      }
      timelineMap[key] = (timelineMap[key] || 0) + 1;
    });

    const timeline = Object.entries(timelineMap).map(([time, count]) => ({
      time,
      clicks: count,
    }));

    // Aggregate Devices
    const deviceMap = {};
    // Aggregate Browsers
    const browserMap = {};
    // Aggregate OS
    const osMap = {};
    // Aggregate Countries
    const countryMap = {};
    // Aggregate Referrers
    const referrerMap = {};

    clicks.forEach((c) => {
      const dev = c.device || 'Desktop';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;

      const br = c.browser || 'Unknown';
      browserMap[br] = (browserMap[br] || 0) + 1;

      const os = c.os || 'Unknown';
      osMap[os] = (osMap[os] || 0) + 1;

      const country = c.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;

      const ref = c.referrer || 'Direct';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });

    const formatBreakdown = (map) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return res.status(200).json({
      success: true,
      link: {
        id: link.id,
        slug: link.slug,
        title: link.title,
        originalUrl: link.originalUrl,
        shortUrl: `${baseUrl}/${link.slug}`,
        createdAt: link.createdAt,
      },
      summary: {
        totalClicks: link.totalClicks,
        rangeClicks: clicks.length,
        uniqueVisitors: uniqueIps.size,
      },
      timeline,
      devices: formatBreakdown(deviceMap),
      browsers: formatBreakdown(browserMap),
      operatingSystems: formatBreakdown(osMap),
      countries: formatBreakdown(countryMap),
      referrers: formatBreakdown(referrerMap),
      recentClicks: clicks.slice(0, 50),
    });
  } catch (error) {
    next(error);
  }
};

const getUserSummaryAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userLinks = await prisma.link.findMany({
      where: { userId },
      select: { id: true, totalClicks: true },
    });

    const totalLinks = userLinks.length;
    const totalClicks = userLinks.reduce((acc, l) => acc + l.totalClicks, 0);

    const linkIds = userLinks.map((l) => l.id);

    // Clicks over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentClicks = await prisma.click.findMany({
      where: {
        linkId: { in: linkIds },
        timestamp: { gte: sevenDaysAgo },
      },
      select: { timestamp: true, device: true, country: true },
      orderBy: { timestamp: 'asc' },
    });

    // Timeline for user summary
    const timelineMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      timelineMap[dayKey] = 0;
    }

    recentClicks.forEach((c) => {
      const day = c.timestamp.toISOString().split('T')[0];
      if (timelineMap[day] !== undefined) {
        timelineMap[day]++;
      }
    });

    const timeline = Object.entries(timelineMap).map(([time, clicks]) => ({
      time,
      clicks,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalLinks,
        totalClicks,
        clicksLast7Days: recentClicks.length,
      },
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLinkAnalytics,
  getUserSummaryAnalytics,
};
