import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Maps each cooldown option to a PostgreSQL INTERVAL
const COOLDOWN_INTERVALS = {
  '20h':  'INTERVAL \'20 hours\'',
  '7d':   'INTERVAL \'7 days\'',
  '31d':  'INTERVAL \'31 days\'',
  '181d': 'INTERVAL \'181 days\'',
  '364d': 'INTERVAL \'364 days\'',
};

// ── GET /api/accounts ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        jubas,
        cooldown,
        jubas_until,
        created_at,
        -- Calculate remaining time directly in the DB
        CASE
          WHEN jubas = true AND jubas_until > NOW()
            THEN EXTRACT(EPOCH FROM (jubas_until - NOW()))::BIGINT
          ELSE NULL
        END AS remaining_seconds
      FROM accounts
      ORDER BY created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// ── POST /api/accounts ────────────────────────────────────
// Body: { name, jubas, cooldown }
// cooldown = "20h" | "7d" | "31d" | "181d" | "364d" | null
router.post('/', async (req, res) => {
  const { name, jubas = false, cooldown = null } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  if (jubas && !COOLDOWN_INTERVALS[cooldown]) {
    return res.status(400).json({
      error: 'Invalid cooldown. Must be: 20h, 7d, 31d, 181d or 364d'
    });
  }

  try {
    let result;

    if (jubas && cooldown) {
      // Calculate jubas_until using DB time (UTC) — server clock doesn't matter
      result = await pool.query(`
        INSERT INTO accounts (name, jubas, cooldown, jubas_until)
        VALUES ($1, $2, $3, NOW() + ${COOLDOWN_INTERVALS[cooldown]})
        RETURNING *
      `, [name, jubas, cooldown]);
    } else {
      result = await pool.query(`
        INSERT INTO accounts (name, jubas, cooldown, jubas_until)
        VALUES ($1, false, NULL, NULL)
        RETURNING *
      `, [name]);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ── PUT /api/accounts/:id ─────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, jubas, cooldown, custom_until } = req.body;

  try {
    let result;

    if (!jubas) {
      // Clean account — reset everything
      result = await pool.query(`
        UPDATE accounts
        SET name = $1, jubas = false, cooldown = NULL, jubas_until = NULL
        WHERE id = $2
        RETURNING *
      `, [name, id]);

    } else if (custom_until) {
      // Manual date set by the user — store it directly
      result = await pool.query(`
        UPDATE accounts
        SET name = $1, jubas = true, cooldown = NULL, jubas_until = $2
        WHERE id = $3
        RETURNING *
      `, [name, new Date(custom_until), id]);

    } else if (COOLDOWN_INTERVALS[cooldown]) {
      // Fixed cooldown — recalculate from NOW()
      result = await pool.query(`
        UPDATE accounts
        SET name = $1, jubas = true, cooldown = $2,
            jubas_until = NOW() + ${COOLDOWN_INTERVALS[cooldown]}
        WHERE id = $3
        RETURNING *
      `, [name, cooldown, id]);

    } else {
      return res.status(400).json({ error: 'Invalid cooldown or missing custom_until' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// ── DELETE /api/accounts/:id ──────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted', account: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;