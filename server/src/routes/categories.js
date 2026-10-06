const router = require('express').Router();
const { body } = require('express-validator');
const wrap = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { requireRole } = auth;
const c = require('../controllers/categoryController');

const nameRule = [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters')];

router.use(auth);
router.get('/', wrap(c.list));
router.post('/', requireRole('agent'), nameRule, validate, wrap(c.create));
router.put('/:id', requireRole('agent'), nameRule, validate, wrap(c.update));
router.delete('/:id', requireRole('agent'), wrap(c.remove));

module.exports = router;
