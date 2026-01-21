
import React, { useState, useCallback, useRef } from 'react';
import { VOICES, EMOTIONS, EXAMPLE_PHRASES } from './constants';
import { ttsService } from './services/geminiService';
import { GeneratedAudio, Emotion } from './types';
import { downloadAudioBuffer } from './utils/audioHelpers';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setCurrentlyPlayingId(null);
  }, []);

  const playAudio = useCallback((audio: GeneratedAudio) => {
    stopPlayback();

    const ctx = ttsService.getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = audio.audioBuffer;

    if (!analyzerRef.current) {
      analyzerRef.current = ctx.createAnalyser();
      analyzerRef.current.fftSize = 256;
    }

    source.connect(analyzerRef.current);
    analyzerRef.current.connect(ctx.destination);

    source.onended = () => {
      setCurrentlyPlayingId(null);
    };

    source.start(0);
    audioSourceRef.current = source;
    setCurrentlyPlayingId(audio.id);
  }, [stopPlayback]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('দয়া করে কিছু লিখুন। (Please enter some text.)');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const audioBuffer = await ttsService.generateBengaliSpeech(
        inputText,
        selectedVoice,
        selectedEmotion
      );

      const newAudio: GeneratedAudio = {
        id: Math.random().toString(36).substr(2, 9),
        text: inputText,
        voice: selectedVoice,
        audioBuffer,
        timestamp: Date.now(),
      };

      setHistory(prev => [newAudio, ...prev].slice(0, 10));
      playAudio(newAudio);
    } catch (err: any) {
      setError(`ভুল হয়েছে: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (audio: GeneratedAudio) => {
    const filename = `bengali_tts_${audio.id}.wav`;
    downloadAudioBuffer(audio.audioBuffer, filename);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-2">
          কণ্ঠস্বর
        </h1>
        <p className="text-slate-400 text-lg">Bengali Text to Speech Generator</p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Controls */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-emerald-500/10">
            <label className="block text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-wider">
              আপনার লেখা এখানে লিখুন (Input Text)
            </label>
            <textarea
              className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none placeholder-slate-500"
              placeholder="এখানে বাংলা লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-slate-500 flex items-center mr-2">উদাহরণ:</span>
              {EXAMPLE_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(phrase)}
                  className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md transition-colors truncate max-w-[150px]"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-2xl">
              <label className="block text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                কণ্ঠস্বর (Voice)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selectedVoice === v.id 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' 
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="font-medium">{v.name}</span>
                    <span className="text-[10px] opacity-60">{v.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <label className="block text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                আবেগ (Emotion)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setSelectedEmotion(e.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedEmotion === e.value 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-100' 
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl text-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${
                isGenerating 
                ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 active:scale-[0.98] text-white shadow-emerald-500/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  তৈরি হচ্ছে... 
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  কথা তৈরি করুন 
                </>
              )}
            </button>

            {currentlyPlayingId && (
              <Visualizer 
                isPlaying={!!currentlyPlayingId} 
                analyzer={analyzerRef.current || undefined} 
              />
            )}
          </div>
        </section>

        {/* History / Recent Files */}
        <aside className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-300 px-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            পূর্ববর্তী অডিও (History)
          </h2>
          
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {history.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl text-slate-500 border-dashed">
                এখনও কোনো অডিও তৈরি করা হয়নি।
              </div>
            ) : (
              history.map((audio) => (
                <div 
                  key={audio.id} 
                  className={`glass-panel p-4 rounded-xl border transition-all flex flex-col gap-3 group ${
                    currentlyPlayingId === audio.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'hover:border-slate-600'
                  }`}
                >
                  <p className="text-sm text-slate-300 line-clamp-2 italic leading-relaxed">
                    "{audio.text}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {VOICES.find(v => v.id === audio.voice)?.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(audio.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => currentlyPlayingId === audio.id ? stopPlayback() : playAudio(audio)}
                        className={`p-2 rounded-full transition-all ${
                          currentlyPlayingId === audio.id 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'
                        }`}
                        title={currentlyPlayingId === audio.id ? 'Stop' : 'Play'}
                      >
                        {currentlyPlayingId === audio.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDownload(audio)}
                        className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-full transition-all"
                        title="Download WAV"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-slate-600 text-sm pb-8">
        <p>&copy; {new Date().getFullYear()} কণ্ঠস্বর - এটি একটি ভয়েস তৈরির এপ </p>
      </footer>
    </div>
  );
};

export default App;
