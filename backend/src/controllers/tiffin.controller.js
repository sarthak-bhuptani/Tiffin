const tiffinService = require('../services/tiffin.service');
const ocrService = require('../services/ocr.service');
const { sendSuccess } = require('../utils/apiResponse');

const createSingleTiffin = async (req, res, next) => {
  try {
    const tiffin = await tiffinService.createSingleTiffin(req.body);
    return sendSuccess(res, 201, 'Tiffin entry saved successfully', { tiffin });
  } catch (error) {
    next(error);
  }
};

const createBulkTiffins = async (req, res, next) => {
  try {
    const { date, entries } = req.body;
    const result = await tiffinService.createBulkTiffins(date, entries);
    return sendSuccess(res, 201, 'Bulk daily tiffins saved successfully', result);
  } catch (error) {
    next(error);
  }
};

const parseNotebookImage = async (req, res, next) => {
  try {
    const entries = await ocrService.parseNotebookContent(req.body);
    return sendSuccess(res, 200, 'Notebook parsed successfully', { entries });
  } catch (error) {
    next(error);
  }
};

const getTiffins = async (req, res, next) => {
  try {
    const tiffins = await tiffinService.getTiffins(req.query);
    return sendSuccess(res, 200, 'Tiffin records fetched successfully', { tiffins });
  } catch (error) {
    next(error);
  }
};

const getTiffinById = async (req, res, next) => {
  try {
    const tiffin = await tiffinService.getTiffinById(req.params.id);
    return sendSuccess(res, 200, 'Tiffin entry fetched successfully', { tiffin });
  } catch (error) {
    next(error);
  }
};

const updateTiffin = async (req, res, next) => {
  try {
    const tiffin = await tiffinService.updateTiffin(req.params.id, req.body);
    return sendSuccess(res, 200, 'Tiffin entry updated successfully', { tiffin });
  } catch (error) {
    next(error);
  }
};

const deleteTiffin = async (req, res, next) => {
  try {
    await tiffinService.deleteTiffin(req.params.id);
    return sendSuccess(res, 200, 'Tiffin entry deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSingleTiffin,
  createBulkTiffins,
  parseNotebookImage,
  getTiffins,
  getTiffinById,
  updateTiffin,
  deleteTiffin,
};
