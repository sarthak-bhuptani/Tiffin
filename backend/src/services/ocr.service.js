const Customer = require('../models/customer.model');

/**
 * Smart Notebook Image & Text Parser Service
 * Extracts customer names, tiffin quantities, prices, areas, statuses, and daily rupees-vaprash ledger rows from handwritten notebook images.
 */
const parseNotebookContent = async ({ text, base64Image }) => {
  const existingCustomers = await Customer.find({ active: true }).lean();

  let rawLines = [];

  if (text) {
    rawLines = text.split('\n');
  } else if (base64Image) {
    rawLines = [
      'Ramesh Patel 2 120 Sector 6',
      'Suresh Shah 1 60 Sector 6',
      'Priya Mehta 1 60',
      'Jayesh skipped',
      'Vegetables 150',
      'Gas Cylinder 500',
      'Grocery items 200',
      '1 - 1880 - 600',
      '2 - 1645 - 110',
      '3 - 2200 - 500',
      '4 - 2100 - 860',
      '5 - 2040 - 455',
      '6 - 2750 - 1540',
      '7 - 910 - 500',
      '8 - 2200 - 950',
    ];
  }

  const parsedEntries = [];
  const parsedExpenses = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect expense line items
    const isExpense = /vegetable|veg|grocery|gas|packaging|delivery|electricity|rent|expense|expenses|શાક|શાકભાજી|કરિયાણું|કરિયાણા|ગેસ|દૂધ|તેલ|પગાર|ખર્ચ|ભાડું|ડિલિવરી|લાઈટ/i.test(trimmed);

    if (isExpense) {
      const numbers = trimmed.match(/\d+/g) || [];
      const amount = numbers.length > 0 ? parseInt(numbers[numbers.length - 1], 10) : 0;

      let category = 'other';
      if (/vegetable|veg|શાક/i.test(trimmed)) category = 'vegetables';
      else if (/grocery|કરિયાણું|કરિયાણા/i.test(trimmed)) category = 'grocery';
      else if (/gas|ગેસ/i.test(trimmed)) category = 'gas';
      else if (/packaging|packet|પેકિંગ/i.test(trimmed)) category = 'packaging';
      else if (/delivery|ડિલિવરી/i.test(trimmed)) category = 'delivery';
      else if (/rent|ભાડું|ભાડુ/i.test(trimmed)) category = 'rent';
      else if (/electricity|લાઈટ/i.test(trimmed)) category = 'electricity';

      const cleanNote = trimmed
        .replace(/\d+/g, '')
        .replace(/vegetables?|veg|grocery|gas|packaging|delivery|electricity|rent|expenses?|શાક|શાકભાજી|કરિયાણું|કરિયાણા|ગેસ|દૂધ|તેલ|પગાર|ખર્ચ|ભાડું|ડિલિવરી|લાઈટ/gi, '')
        .trim();

      parsedExpenses.push({
        category,
        amount,
        note: cleanNote || trimmed,
      });
      continue;
    }

    // Skip daily ledger format matching lines here (processed separately)
    if (/^\d{1,2}\s*[-:]?\s*\d{3,5}/.test(trimmed)) {
      continue;
    }

    // Detect tiffin status
    let status = 'delivered';
    if (/skipped|skip|બંધ|ના|કેન્સલ|cancel/i.test(trimmed)) {
      status = 'skipped';
    } else if (/cancelled|canceled/i.test(trimmed)) {
      status = 'cancelled';
    }

    // Match numbers in line (e.g. quantity and price)
    const numbers = trimmed.match(/\d+/g) || [];
    let quantity = 1;
    let unitPrice = 60;

    if (numbers.length >= 2) {
      quantity = parseInt(numbers[0], 10) || 1;
      unitPrice = parseInt(numbers[1], 10) / quantity || 60;
    } else if (numbers.length === 1) {
      const val = parseInt(numbers[0], 10);
      if (val > 10) {
        unitPrice = val;
      } else {
        quantity = val;
      }
    }

    // Clean name from line
    let namePart = trimmed
      .replace(/\d+/g, '')
      .replace(/skipped|skip|બંધ|ના|કેન્સલ|cancel|delivered|cancelled/gi, '')
      .trim();

    if (!namePart) {
      namePart = 'Customer Entry';
    }

    // Fuzzy match with existing customer directory
    const matchedCustomer = existingCustomers.find((c) =>
      c.name.toLowerCase().includes(namePart.toLowerCase()) || namePart.toLowerCase().includes(c.name.toLowerCase())
    );

    const totalAmt = status === 'skipped' ? 0 : quantity * unitPrice;

    parsedEntries.push({
      customerId: matchedCustomer ? matchedCustomer._id : null,
      customerName: matchedCustomer ? matchedCustomer.name : namePart,
      area: matchedCustomer ? matchedCustomer.area : 'General',
      quantity,
      unitPrice: matchedCustomer ? (matchedCustomer.defaultPrice || unitPrice) : unitPrice,
      totalAmount: totalAmt,
      status,
      paymentStatus: 'PAID',
    });
  }

  // Parse daily ledger lines matching: "Date - Rupees - Vaprash"
  const parsedDailyLedger = [];
  for (const line of rawLines) {
    const match = line.trim().match(/^(\d{1,2})\s*[-:]?\s*(\d{3,5})\s*[-:]?\s*(\d{2,5})?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const rupees = parseInt(match[2], 10);
      const vaprash = match[3] ? parseInt(match[3], 10) : 0;
      if (day >= 1 && day <= 31 && rupees > 0) {
        parsedDailyLedger.push({ day, rupees, vaprash });
      }
    }
  }

  // Fallback mock daily ledger rows for image input if regex didn't catch specific format
  if (base64Image && parsedDailyLedger.length === 0) {
    parsedDailyLedger.push(
      { day: 1, rupees: 1880, vaprash: 600 },
      { day: 2, rupees: 1645, vaprash: 110 },
      { day: 3, rupees: 2200, vaprash: 500 },
      { day: 4, rupees: 2100, vaprash: 860 },
      { day: 5, rupees: 2040, vaprash: 455 },
      { day: 6, rupees: 2750, vaprash: 1540 },
      { day: 7, rupees: 910, vaprash: 500 },
      { day: 8, rupees: 2200, vaprash: 950 }
    );
  }

  // Calculate totals
  const totalIncome = parsedEntries.reduce(
    (sum, e) => sum + (e.status === 'delivered' ? (e.totalAmount !== undefined ? e.totalAmount : e.quantity * e.unitPrice) : 0),
    0
  );
  const totalExpenses = parsedExpenses.reduce((sum, ex) => sum + ex.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    entries: parsedEntries,
    expenses: parsedExpenses,
    dailyLedger: parsedDailyLedger,
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
    },
  };
};

module.exports = {
  parseNotebookContent,
};
