const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const db = new sqlite3.Database("arcade.db")

db.run(`
CREATE TABLE IF NOT EXISTS scores(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT,
  level TEXT,
  score INTEGER
)
`)

app.post("/save-score", (req, res) => {
  const { game, level, score } = req.body
  db.run(
    "INSERT INTO scores(game, level, score) VALUES(?,?,?)",
    [game, level, score],
    err => {
      if (err) return res.status(500).json({ status: "error" })
      res.json({ status: "saved" })
    }
  )
})

app.get("/high-score/:game/:level", (req, res) => {
  const { game, level } = req.params
  db.get(
    "SELECT MAX(score) as high FROM scores WHERE game=? AND level=?",
    [game, level],
    (err, row) => {
      if (err) return res.json({ high: 0 })
      res.json({ high: row && row.high ? row.high : 0 })
    }
  )
})

app.listen(3000, () => {
  console.log("Arcade Backend Running on http://localhost:3000")
})
