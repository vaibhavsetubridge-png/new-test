const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Multer config: store files on disk, keep original extension
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// POST /api/upload  — upload up to 10 images at once
router.post("/", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }
  const uploaded = req.files.map((f) => ({
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
    url: `/uploads/${f.filename}`,
  }));
  res.status(201).json(uploaded);
});

// GET /api/upload  — list all uploaded images
router.get("/", (_req, res) => {
  const imageExts = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  const files = fs
    .readdirSync(UPLOADS_DIR)
    .filter((f) => imageExts.test(f))
    .map((f) => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, f));
      return { filename: f, size: stat.size, url: `/uploads/${f}`, uploadedAt: stat.mtime };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(files);
});

// DELETE /api/upload/:filename  — delete a specific image
router.delete("/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filepath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: "File not found" });
  fs.unlinkSync(filepath);
  res.json({ message: "File deleted" });
});

// Multer error handler
router.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message });
});

module.exports = router;
