const express = require('express');
const router = express.Router();
const db = require('../db');

// GET -> Show all guests (/api/guests)
router.get('/guests', (req, res) => {
    const query = 'SELECT * FROM guests;';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// POST -> Add guest 
router.post('/guests', (req, res) => {
  const { 
    name, 
    id_seat,
    is_child = false,
    is_vegetarian = false,
    is_vegan = false,
    is_gluten_intolerant = false,
    has_other_diet = false,
    other_diet_text = null,
    has_allergies = false,
    allergy_text = null,
    observations = null,
  } = req.body;

  const query = `
    INSERT INTO guests (
      name, id_seat,
      is_child, is_vegetarian, is_vegan, is_gluten_intolerant,
      has_other_diet, other_diet_text,
      has_allergies, allergy_text,
      observations
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name, id_seat,
    is_child, is_vegetarian, is_vegan, is_gluten_intolerant,
    has_other_diet, other_diet_text,
    has_allergies, allergy_text,
    observations
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({
      id: result.insertId,
      name,
      id_seat,
      is_child,
      is_vegetarian, 
      is_vegan,
      is_gluten_intolerant,
      has_other_diet,
      other_diet_text,
      has_allergies,
      allergy_text,
      observations,
    })
  })
});

// DELETE -> Delete guest
router.delete('/guests/:id_seat', (req, res) => {
  const { id_seat } = req.params;
  console.log("Recieved id_seat: ", id_seat)
  const query = `DELETE FROM guests WHERE id_seat = ?`;

  db.query(query, [id_seat], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(204).end();
  });
});

// GET -> Show all guests tables with their seats
router.get('/tables', (req, res) => {
  const query = `
    SELECT t.id_table AS table_id, t.table_number, t.floor,
           s.id AS seat_id, s.seat_number,
           g.name AS guest_name
    FROM tables t
    LEFT JOIN seats s ON t.id_table = s.id_table
    LEFT JOIN guests g ON s.id = g.id_seat
    ORDER BY table_id, s.seat_number, t.floor;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

module.exports = router;