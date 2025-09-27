const speakBtn = document.getElementById("speakBtn");
const status = document.getElementById("status");
const responseEl = document.getElementById("response");

speakBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'tr-TR';
  recognition.start();
  status.textContent = "Durum: Dinleniyor...";

  recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    status.textContent = `Kullanıcı dedi: "${userText}"`;

    // GPT-4 + Airtable backend sorgusu
    const res = await fetch("/sorgu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userText })
    });
    const data = await res.json();

    if (data.error) {
      responseEl.textContent = "Hata: " + data.error;
      return;
    }

    const resultText = `Oda ${data.oda} için boş günler: ${data.freeDays.join(", ")}`;
    responseEl.textContent = resultText;

    // Sesli yanıt
    const utterance = new SpeechSynthesisUtterance(resultText);
    speechSynthesis.speak(utterance);
  };
});
