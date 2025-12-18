
import React, { useState, useCallback, useEffect } from 'react';
import { refinePrompt } from './services/gemini';
import { PromptHistoryItem } from './types';
import { 
  Sparkles, 
  History, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [basePrompt, setBasePrompt] = useState('');
  const [instruction, setInstruction] = useState('');
  const [modifiedPrompt, setModifiedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Geçmişi yerel depolamadan yükle
  useEffect(() => {
    const saved = localStorage.getItem('prompt_refiner_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Geçmiş yüklenemedi", e);
      }
    }
  }, []);

  // Geçmiş değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('prompt_refiner_history', JSON.stringify(history));
  }, [history]);

  const handleRefine = async () => {
    if (!basePrompt.trim() || !instruction.trim()) {
      setError("Lütfen hem ana metni hem de değişim talimatını doldurun.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await refinePrompt({ basePrompt, instruction });
      setModifiedPrompt(result);
      
      const newItem: PromptHistoryItem = {
        id: crypto.randomUUID(),
        original: basePrompt,
        instruction: instruction,
        modified: result,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10)); // Son 10 kaydı tut
    } catch (err: any) {
      setError(err.message || "Bir şeyler ters gitti");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearInputs = () => {
    setBasePrompt('');
    setInstruction('');
    setModifiedPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Üst Bilgi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Zap className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              PromptDüzenleyici AI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <button 
              onClick={clearInputs}
              className="hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" /> Hepsini Temizle
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Giriş Bölümü */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Ana Prompt (Metin)
              </label>
              <span className="text-xs text-slate-400">Korumak istediğiniz içerik</span>
            </div>
            <textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Orijinal uzun promptunuzu buraya yapıştırın..."
              className="w-full h-64 p-5 text-slate-800 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <label className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                Değişim Talimatı
              </label>
              <span className="text-xs text-indigo-400">Hangi bölümün değişmesini istiyorsunuz?</span>
            </div>
            <div className="p-1">
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Örnek: 'Hedef kitleyi yaşlı vatandaşlar olarak değiştir' veya 'İlk cümleyi daha iddialı yap'..."
                className="w-full h-32 p-4 text-slate-800 focus:outline-none focus:ring-0 resize-none text-base"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-start gap-3">
              <div className="bg-red-200 p-1 rounded-full text-xs font-bold px-2 whitespace-nowrap">Hata</div>
              {error}
            </div>
          )}

          <button
            onClick={handleRefine}
            disabled={isLoading || !basePrompt || !instruction}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group ${
              isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Düzenleniyor...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                Promptu Güncelle
              </>
            )}
          </button>

          {modifiedPrompt && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 border-b border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
                <label className="text-sm font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Düzenlenmiş Sonuç
                </label>
                <button 
                  onClick={() => handleCopy(modifiedPrompt)}
                  className="p-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2 text-indigo-600 text-sm font-medium"
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Kopyalandı!' : 'Sonucu Kopyala'}
                </button>
              </div>
              <div className="p-6 bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {modifiedPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Yan Menü / Geçmiş */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-700">Son Sürümler</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                {history.length} Kayıtlı
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-12rem)]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">Henüz geçmiş yok</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 group relative hover:border-indigo-200 transition-all cursor-pointer"
                    onClick={() => {
                      setBasePrompt(item.original);
                      setInstruction(item.instruction);
                      setModifiedPrompt(item.modified);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mb-1 line-clamp-1 italic">
                      "{item.instruction}"
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.modified}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-[11px] text-slate-400 text-center">
                Geçmiş tarayıcınızda yerel olarak saklanır
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Alt Bilgi */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            Gemini 3 Flash ile güçlendirilmiştir • Cerrahi Prompt Düzenleme için tasarlanmıştır
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
