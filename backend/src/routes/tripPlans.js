const router = require('express').Router();
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(authenticate);

// GET /trip-plans
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM trip_plans WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    return res.json({ tripPlans: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /trip-plans
router.post('/', validate(schemas.tripPlan), async (req, res) => {
  try {
    const { name, description, startDate, endDate, destinations, totalBudget, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const { rows } = await pool.query(
      `INSERT INTO trip_plans (user_id, name, description, start_date, end_date, destinations, total_budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, name, description || null, startDate || null, endDate || null,
       JSON.stringify(destinations || []), totalBudget || null, status || 'planning']
    );
    return res.status(201).json({ success: true, tripPlan: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /trip-plans/:id — partial update, so all fields optional
router.put('/:id', validate(schemas.tripPlan.partial()), async (req, res) => {
  try {
    const allowed = ['name', 'description', 'start_date', 'end_date', 'destinations', 'total_budget', 'status'];
    const updates = [];
    const values = [];
    let i = 1;

    const map = { startDate: 'start_date', endDate: 'end_date', totalBudget: 'total_budget' };
    for (const [k, v] of Object.entries(req.body)) {
      const col = map[k] || k;
      if (allowed.includes(col)) {
        updates.push(`${col} = $${i++}`);
        values.push(col === 'destinations' ? JSON.stringify(v) : v);
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'No valid fields' });

    values.push(req.params.id, req.user.id);
    const { rows } = await pool.query(
      `UPDATE trip_plans SET ${updates.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Trip plan not found' });
    return res.json({ success: true, tripPlan: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /trip-plans/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trip_plans WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
