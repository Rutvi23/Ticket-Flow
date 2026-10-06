const router = require('express').Router();
const { body } = require('express-validator');
const wrap = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { requireRole } = auth;
const t = require('../controllers/ticketController');
const cm = require('../controllers/commentController');

const ticketRules = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('category_id').optional({ nullable: true, checkFalsy: true }).isInt().withMessage('Invalid category'),
];
const commentRule = [body('body').trim().notEmpty().withMessage('Comment cannot be empty')];

router.use(auth);

router.get('/', wrap(t.list));
router.post('/', ticketRules, validate, wrap(t.create));
router.get('/:id', wrap(t.getOne));
router.put('/:id', ticketRules, validate, wrap(t.update));
router.delete('/:id', wrap(t.remove));

router.patch(
  '/:id/status',
  requireRole('agent'),
  body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).withMessage('Invalid status'),
  validate,
  wrap(t.setStatus)
);
router.patch('/:id/assign', requireRole('agent'), wrap(t.assignToMe));

router.get('/:id/comments', wrap(cm.list));
router.post('/:id/comments', commentRule, validate, wrap(cm.create));

module.exports = router;
