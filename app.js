const speakBtn = document.getElementById("speakBtn");
const result = document.getElementById("result");

const recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
    ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    : null;

if (!recognition) {
  alert("Tarayıcınız konuşmayı desteklemiyor!");
  speakBtn.disabled = true;
}

recognition.lang = "tr-TR";

speakBtn.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  result.innerText = "Sorgulanıyor: " + text;

  const res = await fetch("/sorgu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  result.innerText = `AI: ${data.gpt}\nAirtable: ${JSON.stringify(
    data.airtable.records
  )}`;
};
