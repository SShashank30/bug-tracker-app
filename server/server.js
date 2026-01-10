const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// DATABASE CONNECTION
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '', // DBngin usually has no password. If it does, type it here.
  database: 'bugtracker',
});

// TEST CONNECTION
db.getConnection((err) => {
  if (err) console.log("❌ DB Error: " + err);
  else console.log("✅ Connected to MySQL Database!");
});

// --- API ROUTES ---

// 1. GET ALL TICKETS
app.get('/api/tickets', (req, res) => {
  db.query("SELECT * FROM tickets ORDER BY created_at DESC", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

// 2. CREATE TICKET
app.post('/api/tickets', (req, res) => {
  const q = "INSERT INTO tickets (`title`, `description`, `assignee`, `status`, `priority`) VALUES (?)";
  const values = [
    req.body.title,
    req.body.description,
    req.body.assignee,
    req.body.status,
    req.body.priority
  ];
  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Ticket created");
  });
});

// 3. DELETE TICKET
app.delete('/api/tickets/:id', (req, res) => {
  db.query("DELETE FROM tickets WHERE id = ?", [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Ticket deleted");
  });
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});