import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  try {
    const { prompt, model = "gemini-2.0-flash" } = await request.json();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model, contents: prompt });
    return NextResponse.json({ text: response.text });
  } catch (error) {
    return NextResponse.json({ error: `Erro na API Gemini: ${error}` }, { status: 500 });
  }
}
