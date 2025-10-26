import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Create postcard
router.post("/", async (req, res) => {
  const { sender, recipientName, message, backImage, frontImage } = req.body;

  let recipient = await pool.query("SELECT * FROM users WHERE name=$1", [recipientName]);
  let recipientId;

  if (!recipient.rows.length) {
    const r = await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [recipientName]);
    recipientId = r.rows[0].id;
  } else {
    recipientId = recipient.rows[0].id;
  }

  await pool.query(
    `INSERT INTO postcards (sender, recipient_id, message, back_image_url, front_image_url) 
     VALUES ($1,$2,$3,$4,$5)`,
    [sender, recipientId, message, backImage, frontImage]
  );

  res.json({ ok: true });
});

// Get mailbox for recipient
router.get("/mailbox", async (req, res) => {
  const { name } = req.query;
  const user = await pool.query("SELECT * FROM users WHERE name=$1", [name]);
  if (!user.rows.length) return res.json([]);
  const postcards = await pool.query(
    "SELECT * FROM postcards WHERE recipient_id=$1 AND is_archived=false ORDER BY created_at ASC",
    [user.rows[0].id]
  );
  res.json(postcards.rows);
});

// Archive postcard
router.post("/:id/archive", async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE postcards SET is_archived=true WHERE id=$1", [id]);
  res.json({ ok: true });
});

export default router;
