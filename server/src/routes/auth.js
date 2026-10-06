const router = require('express').Router();
const { body } = require('express-validator');
const wrap = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  wrap(c.register)
);
router.post(
  '/login',
  [body('email').isEmail().withMessage('A valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  wrap(c.login)
);
router.get('/me', auth, wrap(c.me));

module.exports = router;
