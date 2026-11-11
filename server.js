const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (your HTML pages)
app.use(express.static(__dirname)); 

// --- Database connection → PNGmetHub ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PNGmetHub',
  password: 'Behibill14',   // <-- Your password
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PNGmetHub');
    release();
  }
});

// --- SAVE a full forecast report (upsert) ---
app.post('/save-forecast', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      date_picker, time_picker, utc_time,
      validity_time, duty_forecaster, towns, regions
    } = req.body;

    await client.query('BEGIN');

    const headerResult = await client.query(
      `INSERT INTO forecast_headers
         (forecast_date, forecast_time, utc_time, validity_time, duty_forecaster)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (forecast_date, validity_time)
       DO UPDATE SET
         forecast_time   = EXCLUDED.forecast_time,
         utc_time        = EXCLUDED.utc_time,
         duty_forecaster = EXCLUDED.duty_forecaster,
         saved_at        = CURRENT_TIMESTAMP
       RETURNING id, saved_at, (xmax <> 0) AS was_updated`,
      [
        date_picker || null, time_picker || null, utc_time || null, 
        validity_time || null, duty_forecaster || null
      ]
    );

    const headerId = headerResult.rows[0].id;
    const wasUpdated = headerResult.rows[0].was_updated;

    if (wasUpdated) {
      await client.query('DELETE FROM town_forecasts   WHERE header_id = $1', [headerId]);
      await client.query('DELETE FROM region_forecasts WHERE header_id = $1', [headerId]);
    }

    if (towns) {
      for (const [townName, t] of Object.entries(towns)) {
        await client.query(
          `INSERT INTO town_forecasts (header_id, town_name, weather, wind, max_temp, min_temp) VALUES ($1,$2,$3,$4,$5,$6)`,
          [headerId, townName, t.weather || null, t.wind || null, t.max_temp || null, t.min_temp || null]
        );
      }
    }

    if (regions) {
      for (const [regionName, weather] of Object.entries(regions)) {
        await client.query(
          `INSERT INTO region_forecasts (header_id, region_name, weather) VALUES ($1,$2,$3)`,
          [headerId, regionName, weather || null]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, header_id: headerId, replaced: wasUpdated });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('save-forecast error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// --- LIST recent reports (NO CACHE) ---
app.get('/forecast-reports', async (req, res) => {
  try {
    // This prevents the browser from caching the list of reports
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    const result = await pool.query(
      `SELECT id, saved_at, forecast_date, forecast_time, validity_time, duty_forecaster
       FROM forecast_headers
       ORDER BY id DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET one full report (NO CACHE) ---
app.get('/forecast-reports/:id', async (req, res) => {
  try {
    // This prevents the browser from caching the specific report
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const header = await pool.query('SELECT * FROM forecast_headers WHERE id = $1', [req.params.id]);
    if (header.rowCount === 0) return res.status(404).json({ error: 'Report not found' });

    const towns = await pool.query('SELECT * FROM town_forecasts WHERE header_id = $1 ORDER BY id', [req.params.id]);
    const regions = await pool.query('SELECT * FROM region_forecasts WHERE header_id = $1 ORDER BY id', [req.params.id]);

    res.json({ header: header.rows[0], towns: towns.rows, regions: regions.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000 (Network accessible)');
});