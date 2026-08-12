const express = require('express');
const router = express.Router();
const tiffinController = require('../controllers/tiffin.controller');
const validate = require('../middleware/validate.middleware');
const { singleTiffinSchema, bulkTiffinSchema } = require('../validators/tiffin.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', validate(singleTiffinSchema), tiffinController.createSingleTiffin);
router.post('/bulk', validate(bulkTiffinSchema), tiffinController.createBulkTiffins);
router.get('/', tiffinController.getTiffins);
router.get('/:id', tiffinController.getTiffinById);
router.patch('/:id', tiffinController.updateTiffin);
router.delete('/:id', tiffinController.deleteTiffin);

module.exports = router;
