
import { GoogleGenAI } from "@google/genai";
import { RefineRequest } from "../types";

export const refinePrompt = async ({ basePrompt, instruction }: RefineRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    Sen profesyonel bir Prompt Mühendisliği Uzmanısın.
    Görevin, verilen bir "Ana Metni" (Base Prompt), belirli bir "Talimata" (Instruction) göre modifiye etmektir.
    
    KRİTİK KURALLAR:
    1. CERRAHİ MÜDAHALE: Sadece talimatta belirtilen tam cümleleri, kelimeleri veya kavramları değiştir.
    2. BAĞLAM KORUMA: Metnin geri kalanını TAM OLARAK olduğu gibi bırak. Değişiklik istenmeyen kısımları yeniden ifade etme, iyileştirme veya kısaltma.
    3. META KONUŞMA YOK: Sadece nihai değiştirilmiş metni döndür. "İşte değiştirilmiş metniniz" veya "Şu kısımları değiştirdim" gibi açıklamalar ekleme.
    4. DİL VE ÜSLUP: Eğer ana metin Türkçe ise Türkçe devam et. Eğer ana metin resmiyse resmi, yaratıcıysa yaratıcı kal.
    5. HASSASİYET: Talimat neyi değiştirmeni söylüyorsa SADECE o 3-5 kelimeyi veya cümleyi değiştir, ana yapıyı bozma.
  `;

  const prompt = `
    ANA METİN:
    """
    ${basePrompt}
    """

    DEĞİŞİM TALİMATI:
    """
    ${instruction}
    """

    MODİFİYE EDİLMİŞ METİN:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1, // Daha yüksek doğruluk ve orijinal metne sadakat için düşük sıcaklık
      },
    });

    return response.text || "Düzenlenmiş metin oluşturulamadı.";
  } catch (error) {
    console.error("Gemini API Hatası:", error);
    throw new Error("API çağrısı başarısız oldu. Lütfen internet bağlantınızı kontrol edin.");
  }
};
