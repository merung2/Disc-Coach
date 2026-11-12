export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel 금고에 숨겨둔 API 키 가져오기
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
  }

  try {
    const { prompt, systemInstruction } = req.body;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            pairDynamics: { type: "STRING" },
            diagnosis: { type: "STRING" },
            goodPoints: { type: "ARRAY", items: { type: "STRING" } },
            improvePoints: { type: "ARRAY", items: { type: "STRING" } },
            script1Title: { type: "STRING" },
            script1Text: { type: "STRING" },
            script2Title: { type: "STRING" },
            script2Text: { type: "STRING" },
            actionTip: { type: "STRING" }
          },
          required: [
            "pairDynamics", "diagnosis", "goodPoints", "improvePoints",
            "script1Title", "script1Text", "script2Title", "script2Text", "actionTip"
          ]
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json(JSON.parse(resultText));

  } catch (error) {
    return res.status(500).json({ error: 'AI 분석 중 서버 오류가 발생했습니다.' });
  }
}
