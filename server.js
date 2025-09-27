import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basit endpoint
app.post("/sorgu", async (req, res) => {
  try {
    const userText = req.body.text;

    // Airtable örneği (replace base/table)
    const airtableResp = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Rezervasyonlar?filterByFormula=...`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      }
    );
    const airtableData = await airtableResp.json();

    // GPT-4 ile cevap
    const aiResp = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: `Kullanıcı sorusu: ${userText}` }]
    });

    res.json({
      gpt: aiResp.choices[0].message.content,
      airtable: airtableData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
