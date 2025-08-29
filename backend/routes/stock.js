const express = require("express");
const router = express.Router();

// Placeholder routes - implement as needed
router.get("/", (req, res) => res.json({ message: "Stock route" }));
router.get("/:id", (req, res) => res.json({ message: "Stock detail route" }));
router.post("/", (req, res) => res.json({ message: "Create stock route" }));
router.put("/:id", (req, res) => res.json({ message: "Update stock route" }));
router.delete("/:id", (req, res) =>
  res.json({ message: "Delete stock route" })
);

module.exports = router;
