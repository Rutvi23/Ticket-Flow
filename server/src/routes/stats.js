const router = require('express').Router();
const wrap = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const c = require('../controllers/statsController');

router.get('/', auth, wrap(c.get));

module.exports = router;
