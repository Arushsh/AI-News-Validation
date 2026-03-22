import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, context, history } = await req.json();
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let answer = "No response generated.";

    const systemContext = `You are a helpful AI fact-checking assistant for VerifyLens. 
Answer questions about the credibility of this news/claim based on this verification report:
${JSON.stringify(context, null, 2)}
Keep it concise, direct, helpful, and factual.`;

    if (geminiKey) {
      const contents = [{ role: "user", parts: [{ text: systemContext }] }, { role: "model", parts: [{ text: "Understood." }] }];
      if (history) history.forEach((msg: any) => contents.push({ role: msg.role === 'user' ? "user" : "model", parts: [{ text: msg.content }] }));
      contents.push({ role: "user", parts: [{ text: question }] });

      try {
        const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.3 } })
        });
        const gData = await gRes.json();
        if (gData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ answer: gData.candidates[0].content.parts[0].text });
        } else {
          console.warn("Gemini Error or missing candidate:", gData.error || gData);
        }
      } catch (e) {
        console.warn("Gemini Fetch Exception:", e);
      }
    }
    
    // Fallback to Groq if Gemini key isn't present, or if the Gemini fetch failed / returned error
    if (groqKey) {
      const messages = [{ role: "system", content: systemContext }];
      if (history) history.forEach((msg: any) => messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.content }));
      messages.push({ role: "user", content: question });

      const qRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages })
      });
      const qData = await qRes.json();
      if (qData?.choices?.[0]?.message?.content) {
        return NextResponse.json({ answer: qData.choices[0].message.content });
      } else {
        console.error("Groq Response Error:", qData);
        return NextResponse.json({ answer: "Both Gemini and Groq APIs failed to generate a response." });
      }
    }

    return NextResponse.json({ answer: "No valid API keys configured (Gemini/Groq)." });
  } catch (error) {
    console.error('Chat AI Error:', error);
    return NextResponse.json({ answer: 'Failed to process chat query due to a server error.' });
  }
}
