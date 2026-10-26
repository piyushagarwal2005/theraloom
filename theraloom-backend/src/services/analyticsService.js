const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const Client = require('../models/Client');

/**
 * Executes MongoDB Aggregation Pipelines to compute real-time practice metrics
 */
const getPracticeOverview = async (therapistId) => {
  const tId = new mongoose.Types.ObjectId(therapistId);

  // 1. Revenue Aggregation Pipeline
  const revenueSummary = await Payment.aggregate([
    {
      $match: {
        therapistId: tId,
        status: 'captured',
      },
    },
    {
      $group: {
        _id: null,
        grossRevenue: { $sum: '$amount' },
        netRevenue: { $sum: '$netAmount' },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const grossRevenue = revenueSummary[0]?.grossRevenue || 0;
  const netRevenue = revenueSummary[0]?.netRevenue || 0;
  const totalTransactions = revenueSummary[0]?.totalTransactions || 0;

  // 2. Monthly Revenue Trend Aggregation Pipeline
  const monthlyRevenueTrend = await Payment.aggregate([
    {
      $match: {
        therapistId: tId,
        status: 'captured',
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyRevenue = monthlyRevenueTrend.map((item) => ({
    label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    month: item._id.month,
    year: item._id.year,
    revenue: item.revenue,
    sessionsCount: item.count,
  }));

  // 3. Session Status Breakdown Aggregation Pipeline
  const sessionStatusBreakdown = await Session.aggregate([
    {
      $match: {
        therapistId: tId,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusMap = {
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  };

  sessionStatusBreakdown.forEach((item) => {
    if (statusMap[item._id] !== undefined) {
      statusMap[item._id] = item.count;
    }
  });

  const totalSessions = Object.values(statusMap).reduce((a, b) => a + b, 0);

  // 4. Calculate No-Show Rate mathematically
  // noShowRate = (no_show / (completed + no_show + cancelled)) * 100
  const relevantDenominator = statusMap.completed + statusMap.no_show + statusMap.cancelled;
  const noShowRate = relevantDenominator > 0
    ? parseFloat(((statusMap.no_show / relevantDenominator) * 100).toFixed(1))
    : 0;

  // 5. Active Clients Pipeline
  const activeClientsCount = await Client.countDocuments({
    therapistId: tId,
    status: 'active',
  });

  const totalClientsCount = await Client.countDocuments({
    therapistId: tId,
  });

  return {
    grossRevenue,
    netRevenue,
    totalTransactions,
    totalSessions,
    activeClientsCount,
    totalClientsCount,
    noShowRate,
    statusMap,
    monthlyRevenue: formattedMonthlyRevenue,
  };
};

module.exports = {
  getPracticeOverview,
};
