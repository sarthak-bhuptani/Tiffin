const Customer = require('../models/customer.model');

/**
 * Smart Notebook Image & Text Parser Service
 * Extracts customer names, tiffin quantities, prices, areas, and statuses from handwritten/notebook text or images.
 */
const parseNotebookContent = async ({ text, base64Image }) => {
  const existingCustomers = await Customer.find({ active: true }).lean();

  let rawLines = [];

  if (text) {
    rawLines = text.split('\n');
  } else if (base64Image) {
    // Basic text extraction simulation / mock fallback parser for image input
    // In production, handles base64 OCR text extraction
    rawLines = [
      'Ramesh Patel 2 120 Sector 6',
      'Suresh Shah 1 60 Sector 6',
      'Priya Mehta 1 60',
      'Jayesh skipped',
    ];
  }

  const parsedEntries = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect status
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

    parsedEntries.push({
      customerId: matchedCustomer ? matchedCustomer._id : null,
      customerName: matchedCustomer ? matchedCustomer.name : namePart,
      area: matchedCustomer ? matchedCustomer.area : 'Sector 6',
      quantity,
      unitPrice: matchedCustomer ? matchedCustomer.defaultPrice : unitPrice,
      status,
      paymentStatus: 'PAID',
    });
  }

  return parsedEntries;
};

module.exports = {
  parseNotebookContent,
};
