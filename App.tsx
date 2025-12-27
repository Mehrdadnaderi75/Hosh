
import React, { useState, useCallback, useMemo } from 'react';
import LoadingScreen from './components/LoadingScreen';
import { GameStep, GameState, GameType, GameMetadata, GameStepDetail } from './types';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GAMES: GameMetadata[] = [
  {
    id: 'CLASSIC',
    title: 'جادوی کلاسیک',
    description: 'شعبده‌ای با جمع و تفریق ساده که ذهن شما را به چالش می‌کشد.',
    icon: '✨',
    calculateResult: (add, sub) => add - sub,
    getSteps: (add, sub) => [
      { text: 'یک عدد دلخواه در ذهن خود انتخاب کنید.', subText: '(مثلاً بین ۱ تا ۱۰۰)' },
      { text: 'حالا عدد ذهنی خود را با این مقدار جمع کنید:', highlight: add, color: 'text-indigo-400' },
      { text: 'از حاصل به دست آمده، این مقدار را کم کنید:', highlight: sub, color: 'text-pink-400' },
      { text: 'در نهایت، عددی که در ابتدا انتخاب کرده بودید را از حاصل فعلی کم کنید.', subText: 'تمرکز کنید...' }
    ]
  },
  {
    id: 'MULTIPLIER',
    title: 'راز عدد ۵',
    description: 'قدرت ضرب و تقسیم در کشف رازهای پنهان ذهن شما.',
    icon: '🔮',
    calculateResult: () => 5,
    getSteps: () => [
      { text: 'یک عدد در ذهن خود انتخاب کنید.', subText: 'هر عددی که دوست دارید' },
      { text: 'آن را در ۲ ضرب کنید.', highlight: '× ۲', color: 'text-cyan-400' },
      { text: 'عدد ۱۰ را به آن اضافه کنید.', highlight: '+ ۱۰', color: 'text-indigo-400' },
      { text: 'حاصل را بر ۲ تقسیم کنید.', highlight: '÷ ۲', color: 'text-emerald-400' },
      { text: 'حالا عدد اولیه‌ای که انتخاب کرده بودید را از حاصل کم کنید.', subText: 'آماده برای نتیجه؟' }
    ]
  },
  {
    id: 'TRIPLE',
    title: 'معمای عدد ۲',
    description: 'یک الگوریتم پیچیده‌تر برای اثبات هوش ریاضی برنامه.',
    icon: '🧩',
    calculateResult: () => 2,
    getSteps: () => [
      { text: 'یک عدد در ذهن خود تصور کنید.', subText: 'مثلاً عدد شانس شما' },
      { text: 'آن را در ۳ ضرب کنید.', highlight: '× ۳', color: 'text-amber-400' },
      { text: 'عدد ۶ را به آن اضافه کنید.', highlight: '+ ۶', color: 'text-indigo-400' },
      { text: 'حاصل را بر ۳ تقسیم کنید.', highlight: '÷ ۳', color: 'text-purple-400' },
      { text: 'در آخر، عدد اصلی خود را از حاصل کم کنید.', subText: 'فقط یک کلیک تا پاسخ...' }
    ]
  },
  {
    id: 'NINE_MAGIC',
    title: 'افسون عدد ۹',
    description: 'چگونه عدد ۹ همیشه راه خود را به ذهن شما پیدا می‌کند؟',
    icon: '🌀',
    calculateResult: () => 9,
    getSteps: () => [
      { text: 'یک عدد ۲ رقمی انتخاب کنید.', subText: 'مثلاً ۴۵ یا ۷۲' },
      { text: 'ارقام آن را با هم جمع کنید.', subText: 'مثلاً برای ۴۵ می‌شود ۹' },
      { text: 'این مجموع را از عدد اصلی خود کم کنید.', subText: 'حاصل همیشه مضربی از ۹ است' },
      { text: 'حالا ارقام حاصل جدید را با هم جمع کنید تا به یک رقم برسید.', subText: 'من می‌دانم آن رقم چیست...' }
    ]
  },
  {
    id: 'LUCKY_SEVEN',
    title: 'طلسم عدد ۷',
    description: 'عددی مقدس که در محاسبات شما نهفته است.',
    icon: '💎',
    calculateResult: () => 7,
    getSteps: () => [
      { text: 'یک عدد بین ۱ تا ۱۰۰۰ انتخاب کنید.', subText: 'هرچه بزرگتر، هیجان‌انگیزتر!' },
      { text: 'آن را در ۲ ضرب کنید.', highlight: '× ۲', color: 'text-blue-400' },
      { text: 'عدد ۱۴ را به آن اضافه کنید.', highlight: '+ ۱۴', color: 'text-indigo-400' },
      { text: 'حاصل را بر ۲ تقسیم کنید.', highlight: '÷ ۲', color: 'text-teal-400' },
      { text: 'عدد اولیه‌تان را از حاصل نهایی کم کنید.', subText: 'ارواح ریاضی در حال پاسخ دادن هستند...' }
    ]
  },
  {
    id: 'EASY_THREE',
    title: 'راز عدد ۳',
    description: 'یک ترفند سریع و خیره‌کننده برای دوستانتان.',
    icon: '⚡',
    calculateResult: () => 3,
    getSteps: () => [
      { text: 'یک عدد در ذهن داشته باشید.', subText: 'آماده‌اید؟' },
      { text: 'آن را در ۲ ضرب کنید.', highlight: '× ۲', color: 'text-orange-400' },
      { text: 'عدد ۶ را به آن اضافه کنید.', highlight: '+ ۶', color: 'text-rose-400' },
      { text: 'حاصل را نصف کنید (تقسیم بر ۲).', highlight: '÷ ۲', color: 'text-sky-400' },
      { text: 'عدد اصلی را از آن کم کنید.', subText: 'تمام! ذهن شما خوانده شد.' }
    ]
  }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    step: GameStep.LOADING,
    currentGame: null,
    currentStepIndex: 0,
    addValue: 0,
    subValue: 0,
  });
  const [aiMessage, setAiMessage] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const activeGame = useMemo(() => 
    GAMES.find(g => g.id === gameState.currentGame), [gameState.currentGame]
  );

  const steps = useMemo(() => 
    activeGame ? activeGame.getSteps(gameState.addValue, gameState.subValue) : [], 
    [activeGame, gameState.addValue, gameState.subValue]
  );

  const selectGame = (gameId: GameType) => {
    setGameState({
      step: GameStep.START,
      currentGame: gameId,
      currentStepIndex: 0,
      addValue: Math.floor(Math.random() * 10) + 1,
      subValue: Math.floor(Math.random() * 5) + 1,
    });
    setAiMessage('');
  };

  const nextStep = () => {
    if (gameState.currentStepIndex < steps.length - 1) {
      setGameState(prev => ({ ...prev, currentStepIndex: prev.currentStepIndex + 1 }));
    } else {
      setGameState(prev => ({ ...prev, step: GameStep.REVEAL }));
      fetchAiCommentary();
    }
  };

  const fetchAiCommentary = async () => {
    setIsLoadingAi(true);
    const result = activeGame?.calculateResult(gameState.addValue, gameState.subValue) ?? 0;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `کاربر بازی '${activeGame?.title}' را انجام داده و عدد نهایی ${result} است. یک جمله کوتاه، مرموز و هوشمندانه به فارسی بگو که نشان دهد ذهن او را خوانده‌ای. فقط متن را برگردان.`,
      });
      setAiMessage(response.text || '');
    } catch (error) {
      setAiMessage(`من همیشه می‌دانستم که به ${result} می‌رسی...`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const resetToSelection = () => {
    setGameState(prev => ({ ...prev, step: GameStep.SELECTION, currentGame: null }));
  };

  if (gameState.step === GameStep.LOADING) {
    return <LoadingScreen onComplete={() => setGameState(prev => ({ ...prev, step: GameStep.SELECTION }))} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-8 transition-all duration-500 overflow-hidden flex flex-col max-h-[90vh]">
        
        {gameState.step === GameStep.SELECTION ? (
          <div className="animate-fade-in flex flex-col h-full">
            <header className="text-center mb-6">
              <h2 className="text-3xl font-black text-white mb-2">تالار شعبده</h2>
              <p className="text-slate-400">یک بازی را برای شروع انتخاب کنید</p>
            </header>
            <div className="grid gap-3 overflow-y-auto pr-2 custom-scrollbar text-right">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => selectGame(game.id)}
                  className="flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-indigo-600/30 border border-slate-600 hover:border-indigo-500 rounded-2xl transition-all group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{game.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{game.title}</h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1">{game.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <header className="text-center mb-6 flex items-center justify-between">
              <button 
                onClick={resetToSelection}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                title="بازگشت به انتخاب بازی"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-white">{activeGame?.title}</h2>
              <div className="w-10"></div>
            </header>

            <main className="space-y-6 flex-1 flex flex-col justify-center text-center">
              {gameState.step === GameStep.START && (
                <div key={gameState.currentStepIndex} className="animate-fade-in space-y-4">
                  <p className="text-xl text-slate-200 leading-relaxed px-4">
                    {steps[gameState.currentStepIndex].text}
                  </p>
                  {steps[gameState.currentStepIndex].highlight && (
                    <div className={`text-6xl font-black ${steps[gameState.currentStepIndex].color} drop-shadow-lg animate-pulse`}>
                      {steps[gameState.currentStepIndex].highlight}
                    </div>
                  )}
                  {steps[gameState.currentStepIndex].subText && (
                    <p className="text-sm text-slate-500 italic">
                      {steps[gameState.currentStepIndex].subText}
                    </p>
                  )}
                </div>
              )}

              {gameState.step === GameStep.REVEAL && (
                <div className="animate-scale-in flex flex-col items-center">
                  <p className="text-lg text-slate-400 mb-2">عدد نهایی در ذهن شما...</p>
                  <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6 drop-shadow-[0_10px_10px_rgba(129,140,248,0.3)]">
                    {activeGame?.calculateResult(gameState.addValue, gameState.subValue)}
                  </div>
                  {isLoadingAi ? (
                    <div className="flex space-x-2 space-x-reverse items-center justify-center text-slate-500 italic">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <span>هوش مصنوعی در حال تحلیل...</span>
                    </div>
                  ) : (
                    <p className="text-indigo-200 italic text-center text-lg leading-relaxed max-w-[280px]">
                      « {aiMessage || "ریاضیات هرگز دروغ نمی‌گوید."} »
                    </p>
                  )}
                </div>
              )}
            </main>

            <footer className="mt-8 flex flex-col gap-3">
              {gameState.step === GameStep.START ? (
                <button
                  onClick={nextStep}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative"
                >
                  <span className="relative z-10">
                    {gameState.currentStepIndex === steps.length - 1 ? 'مشاهده نتیجه جادویی' : 'مرحله بعدی'}
                  </span>
                  <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1.5 transition-transform duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              ) : (
                <button
                  onClick={resetToSelection}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>بازگشت به منو</span>
                </button>
              )}
              <div className="flex justify-center gap-1 mt-2 mb-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      gameState.step === GameStep.REVEAL 
                        ? 'w-4 bg-indigo-500' 
                        : i === gameState.currentStepIndex 
                          ? 'w-8 bg-indigo-500' 
                          : i < gameState.currentStepIndex 
                            ? 'w-4 bg-indigo-800' 
                            : 'w-4 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </footer>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: slideIn 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default App;
