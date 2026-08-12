const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
