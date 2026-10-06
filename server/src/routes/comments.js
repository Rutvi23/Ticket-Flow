const router = require('express').Router();
const { body } = require('express-validator');
const wrap = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const cm = require('../controllers/commentController');

const rule = [body('body').trim().notEmpty().withMessage('Comment cannot be empty')];

router.use(auth);
router.put('/:id', rule, validate, wrap(cm.update));
router.delete('/:id', wrap(cm.remove));

module.exports = router;
