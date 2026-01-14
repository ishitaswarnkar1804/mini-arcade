const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const db = new sqlite3.Database("arcade.db")

db.run(`
CREATE TABLE IF NOT EXISTS scores(
  game TEXT,
  level TEXT,
  score INTEGER,
  PRIMARY KEY(game, level)
)
`)

app.post("/save-score", (req, res) => {
  const { game, level, score } = req.body

  db.get(
    "SELECT score FROM scores WHERE game=? AND level=?",
    [game, level],
    (err, row) => {
      if (err) return res.status(500).json({ status: "error" })

      if (!row) {
        db.run(
          "INSERT INTO scores(game, level, score) VALUES(?,?,?)",
          [game, level, score],
          () => res.json({ status: "inserted", high: score })
        )
      } else if (score > row.score) {
        db.run(
          "UPDATE scores SET score=? WHERE game=? AND level=?",
          [score, game, level],
          () => res.json({ status: "updated", high: score })
        )
      } else {
        res.json({ status: "kept", high: row.score })
      }
    }
  )
})

app.get("/high-score/:game/:level", (req, res) => {
  const { game, level } = req.params
  db.get(
    "SELECT score FROM scores WHERE game=? AND level=?",
    [game, level],
    (err, row) => {
      if (err || !row) return res.json({ high: 0 })
      res.json({ high: row.score })
    }
  )
})

app.listen(3000, () => {
  console.log("Arcade Backend Running on http://localhost:3000")
})

