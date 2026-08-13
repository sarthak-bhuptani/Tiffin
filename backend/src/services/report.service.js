const DailyTiffin = require('../models/dailyTiffin.model');
const Expense = require('../models/expense.model');
const Payment = require('../models/payment.model');
const Customer = require('../models/customer.model');

const getTodayDashboard = async (targetDateStr) => {
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];

  // 1. Fetch tiffins for today
  const tiffinsToday = await DailyTiffin.find({ date: dateStr });
  let totalTiffins = 0;
  let deliveredCount = 0;
  let skippedCount = 0;
  let billedIncome = 0;
  let collectedIncome = 0;

  tiffinsToday.forEach((t) => {
    if (t.status === 'delivered') {
      deliveredCount += 1;
      totalTiffins += t.quantity;
      billedIncome += t.totalAmount;
      collectedIncome += t.paidAmount || 0;
    } else if (t.status === 'skipped') {
      skippedCount += 1;
    }
  });

  const pendingIncome = Math.max(0, billedIncome - collectedIncome);

  // 2. Fetch expenses for today
  const expensesToday = await Expense.find({ date: dateStr });
  const totalExpenses = expensesToday.reduce((sum, e) => sum + e.amount, 0);

  // 3. Profit calculations
  const netProfitBilled = billedIncome - totalExpenses;
  const netProfitCollected = collectedIncome - totalExpenses;

  // 4. Total pending across all historical tiffins in system
  const pendingAggregation = await DailyTiffin.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: {
        _id: null,
        totalBilled: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
      },
    },
  ]);

  const allTimeBilled = pendingAggregation[0] ? pendingAggregation[0].totalBilled : 0;
  const allTimePaid = pendingAggregation[0] ? pendingAggregation[0].totalPaid : 0;

  // Add extra direct payments not tied to daily tiffin
  const directPayments = await Payment.find({ tiffinId: null });
  const extraPaidSum = directPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalPendingAllTime = Math.max(0, allTimeBilled - (allTimePaid + extraPaidSum));

  // 5. Active regular customers count
  const activeCustomersCount = await Customer.countDocuments({ active: true });

  return {
    date: dateStr,
    summary: {
      todayTiffins: totalTiffins,
      deliveredCount,
      skippedCount,
      billedIncome,
      collectedIncome,
      pendingIncome,
      totalExpenses,
      netProfitBilled,
      netProfitCollected,
      pendingPaymentsTotal: totalPendingAllTime,
      activeCustomersCount,
    },
  };
};

const getRangeReport = async (startDate, endDate) => {
  const tiffinFilter = { date: { $gte: startDate, $lte: endDate } };
  const expenseFilter = { date: { $gte: startDate, $lte: endDate } };

  const tiffins = await DailyTiffin.find(tiffinFilter);
  const expenses = await Expense.find(expenseFilter);

  let totalTiffinsDelivered = 0;
  let totalTiffinsSkipped = 0;
  let totalBilled = 0;
  let totalCollected = 0;

  tiffins.forEach((t) => {
    if (t.status === 'delivered') {
      totalTiffinsDelivered += t.quantity;
      totalBilled += t.totalAmount;
      totalCollected += t.paidAmount || 0;
    } else if (t.status === 'skipped') {
      totalTiffinsSkipped += 1;
    }
  });

  const totalPending = Math.max(0, totalBilled - totalCollected);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalBilled - totalExpenses;
  const cashProfit = totalCollected - totalExpenses;

  // Category breakdown for expenses
  const categoryExpenses = {};
  expenses.forEach((e) => {
    categoryExpenses[e.category] = (categoryExpenses[e.category] || 0) + e.amount;
  });

  return {
    startDate,
    endDate,
    metrics: {
      totalTiffinsDelivered,
      totalTiffinsSkipped,
      totalBilled,
      totalCollected,
      totalPending,
      totalExpenses,
      netProfit,
      cashProfit,
    },
    categoryExpenses,
  };
};

const getMonthlyReport = async (year, month) => {
  // Format month string YYYY-MM
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const startDate = `${monthStr}-01`;
  const endDate = `${monthStr}-31`;

  const report = await getRangeReport(startDate, endDate);

  // Group per customer for monthly billing breakdown
  const tiffins = await DailyTiffin.find({ date: { $gte: startDate, $lte: endDate } });
  const customerMap = {};

  tiffins.forEach((t) => {
    const key = t.customerId ? t.customerId.toString() : t.customerName;
    if (!customerMap[key]) {
      customerMap[key] = {
        customerId: t.customerId,
        customerName: t.customerName,
        area: t.area,
        delivered: 0,
        skipped: 0,
        extra: 0,
        unitPrice: t.unitPrice,
        totalBilled: 0,
        totalPaid: 0,
        totalPending: 0,
      };
    }

    if (t.status === 'delivered') {
      customerMap[key].delivered += t.quantity;
      if (t.quantity > 1) {
        customerMap[key].extra += t.quantity - 1;
      }
      customerMap[key].totalBilled += t.totalAmount;
      customerMap[key].totalPaid += t.paidAmount || 0;
    } else if (t.status === 'skipped') {
      customerMap[key].skipped += 1;
    }
  });

  Object.values(customerMap).forEach((c) => {
    c.totalPending = Math.max(0, c.totalBilled - c.totalPaid);
    c.advanceBalance = Math.max(0, c.totalPaid - c.totalBilled);
  });

  return {
    year,
    month: monthStr,
    summary: report.metrics,
    categoryExpenses: report.categoryExpenses,
    customerBreakdown: Object.values(customerMap),
  };
};

module.exports = {
  getTodayDashboard,
  getRangeReport,
  getMonthlyReport,
};
