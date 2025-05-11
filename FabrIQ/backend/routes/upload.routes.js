const express = require("express");
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Handle image upload
router.post("/", (req, res) => {
  const { image, folder = "general" } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    // 1. Create 'uploads' directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Create subfolder (e.g., 'uploads/logos')
    const folderPath = path.join(uploadDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // 3. Save the image
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const filename = `${Date.now()}.png`;
    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(filePath, base64Data, "base64");

    // 4. Return the public path
    res.json({ path: `/uploads/${folder}/${filename}` });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to save image" });
  }
});

module.exports = router;