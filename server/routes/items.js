const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { Item } = require("../db");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.findAll({ order: [["createdAt", "DESC"]] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE item
router.post("/", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE item
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// TOGGLE done status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    await item.update({ done: !item.done });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE item (also removes its image file)
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    // Remove associated image file if it exists
    if (item.imageUrl) {
      const filename = path.basename(item.imageUrl);
      const filepath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await item.destroy();
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPLOAD image for a specific item
router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      // Clean up uploaded file if item not found
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Item not found" });
    }
    // Remove old image if replacing
    if (item.imageUrl) {
      const oldFile = path.join(UPLOADS_DIR, path.basename(item.imageUrl));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    await item.update({ imageUrl });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE image for a specific item
router.delete("/:id/image", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.imageUrl) {
      const filepath = path.join(UPLOADS_DIR, path.basename(item.imageUrl));
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      await item.update({ imageUrl: "" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
