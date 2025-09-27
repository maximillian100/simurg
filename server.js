import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "Rezervasyonlar";

app.post("/sorgu", async (req, res) => {
  const userText = req.body.text;

  // 1️⃣ GPT-4 ile JSON çıkar
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {role: "system", content: "Sen bir rezervasyon sorgu parserısın."},
      {role: "user", content: `Kullanıcı metni: "${userText}"\nJSON formatında dön:`}
    ]
  });

  const jsonStr = completion.choices[0].message.content.trim();
  let query;
  try {
    query = JSON.parse(jsonStr);
  } catch (e) {
    return res.status(400).json({ error: "JSON parse edilemedi", raw: jsonStr });
  }

  // 2️⃣ Airtable sorgu
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({Oda Numarası}='${query.oda}')`;
  const airtableRes = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
  const data = await airtableRes.json();

  const rezervasyonlar = data.records.map(r => ({
    start: new Date(r.fields["Başlangıç Tarihi"]),
    end: new Date(r.fields["Bitiş Tarihi"])
  }));

  const startDate = new Date(query.baslangic_tarihi);
  const endDate = new Date(query.bitis_tarihi);
  const freeDays = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (!rezervasyonlar.some(r => d >= r.start && d <= r.end)) {
      freeDays.push(d.toISOString().slice(0,10));
    }
  }

  res.json({ oda: query.oda, freeDays });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
