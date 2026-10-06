// Allowed status changes: what each status may move to
const ALLOWED = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

const canTransition = (from, to) => (ALLOWED[from] || []).includes(to);

module.exports = { ALLOWED, canTransition };
