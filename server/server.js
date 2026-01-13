const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
      rejectUnauthorized: true
  }
});

db.getConnection((err) => {
  if (err) console.log("DB Error: " + err);
  else console.log("Connected to MySQL Database!");
});

app.get('/api/tickets', (req, res) => {
  db.query("SELECT * FROM tickets ORDER BY created_at DESC", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

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

app.delete('/api/tickets/:id', (req, res) => {
  db.query("DELETE FROM tickets WHERE id = ?", [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json("Ticket deleted");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const path = require("path");



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
