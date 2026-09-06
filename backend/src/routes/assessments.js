import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';

const router = Router();
router.use(authenticate);

const INSTRUMENTS = {
  en: {
    version: 'v1',
    domains: ['orientation', 'registration', 'delayed_recall', 'attention', 'language', 'visuospatial'],
    max_score: 30,
    items: [
      { id: 'or1', domain: 'orientation', prompt: 'What is today\'s date?', type: 'spoken', scoring: { exact: 3, partial: 1, none: 0 } },
      { id: 'or2', domain: 'orientation', prompt: 'What village or town are we in?', type: 'spoken', scoring: { exact: 3, partial: 1, none: 0 } },
      { id: 'or3', domain: 'orientation', prompt: 'What season is it right now?', type: 'spoken', scoring: { exact: 2, partial: 1, none: 0 } },
      { id: 're1', domain: 'registration', prompt: 'I will say three words. Repeat them: Banyan, Lotus, Peacock', type: 'spoken', scoring: { exact: 3, partial: 1, none: 0 } },
      { id: 'at1', domain: 'attention', prompt: 'Count backwards from 100 by 7s. Give three numbers.', type: 'spoken', scoring: { exact: 3, partial: 2, none: 0 } },
      { id: 'at2', domain: 'attention', prompt: 'Spell WORLD backwards.', type: 'spoken', scoring: { exact: 3, partial: 2, none: 0 } },
      { id: 'dr1', domain: 'delayed_recall', prompt: 'What were the three words I asked you to remember?', type: 'spoken', scoring: { exact: 3, partial: 1, none: 0 } },
      { id: 'la1', domain: 'language', prompt: 'Name the items in this picture: broom, lamp, key.', type: 'spoken', scoring: { exact: 3, partial: 2, none: 0 } },
      { id: 'la2', domain: 'language', prompt: 'Repeat: No ifs, ands, or buts.', type: 'spoken', scoring: { exact: 3, partial: 1, none: 0 } },
      { id: 'vs1', domain: 'visuospatial', prompt: 'Draw two intersecting figures: a square and a circle.', type: 'drawing', scoring: { exact: 3, partial: 2, none: 0 } },
      { id: 'vs2', domain: 'visuospatial', prompt: 'Identify the figure: show a simple drawing.', type: 'spoken', scoring: { exact: 1, partial: 0, none: 0 } },
    ],
  },
};

router.get('/assessments/instrument', async (req, res) => {
  const locale = req.query.locale || 'en';
  const instrument = INSTRUMENTS[locale] || INSTRUMENTS.en;
  res.json(instrument);
});

router.post('/patients/:patientId/assessments', requirePatientAccess, async (req, res) => {
  try {
    const { kind, locale, responses, notes } = req.body;
    if (!responses || !Array.isArray(responses)) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'responses array required' } });
    }
    const instrument = INSTRUMENTS[locale || 'en'] || INSTRUMENTS.en;
    let totalScore = 0;
    const domainScores = {};
    for (const r of responses) {
      const item = instrument.items.find((i) => i.id === r.item_id);
      if (!item) continue;
      const score = r.score || 0;
      totalScore += score;
      domainScores[item.domain] = (domainScores[item.domain] || 0) + score;
    }
    const id = uuid();
    const { rows } = await query(
      `INSERT INTO assessments (id, patient_id, kind, instrument_version, locale, administered_by,
        started_at, completed_at, total_score, max_score, domain_scores, responses, notes)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW(),$7,$8,$9,$10,$11)
       RETURNING *`,
      [id, req.params.patientId, kind || 'adhoc', instrument.version, locale || 'en',
       req.user.id, totalScore, instrument.max_score,
       JSON.stringify(domainScores), JSON.stringify(responses), notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create assessment error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to create assessment' } });
  }
});

router.get('/patients/:patientId/assessments', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM assessments WHERE patient_id = $1 ORDER BY started_at DESC`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List assessments error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list assessments' } });
  }
});

router.get('/assessments/:id', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM assessments WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Assessment not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get assessment error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to get assessment' } });
  }
});

export default router;
