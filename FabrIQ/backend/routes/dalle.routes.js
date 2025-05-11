const express = require("express");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const router = express.Router();

// Hugging Face Configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const HF_TOKEN = process.env.HF_API_TOKEN; // Get from https://huggingface.co/settings/tokens

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: prompt,
        options: { wait_for_model: true } // Important for free tier
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const imageBuffer = await response.buffer();
    res.status(200).json({
      photo: imageBuffer.toString('base64')
    });

  } catch (error) {
    console.error("Hugging Face Error:", error);
    res.status(500).json({ 
      error: error.message,
      details: "Ensure your HF token is valid and model is loaded (may take 20s first time)"
    });
  }
});

module.exports = router;