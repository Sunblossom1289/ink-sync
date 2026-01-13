
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAIWritingSuggestion = async (context: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful writing assistant for InkSync. 
      The current context is: "${context}". 
      The user wants you to: "${prompt}". 
      Please provide a concise, creative completion or suggestion. Keep the tone friendly and helpful.`,
    });
    return response.text || "I couldn't think of anything right now. ✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The muse is taking a nap. Try again in a second! ☁️";
  }
};

// --- Components ---

const Sidebar = ({ documents, activeDocId, onSelectDoc, onNewDoc, onDeleteDoc, collaborators }) => {
  useEffect(() => {
    // @ts-ignore
    if (window.gsap) {
      // @ts-ignore
      window.gsap.fromTo(".sidebar-item", 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [documents.length]);

  return (
    <div className="w-80 h-full flex flex-col bg-white p-6 space-y-6 border-r border-pink-50 shadow-2xl z-20">
      <div className="flex items-center space-x-3 mb-4 px-2">
        <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg btn-pop">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
           <h1 className="text-2xl font-bold text-gray-800 handwriting leading-none">InkSync</h1>
           <span className="text-[10px] font-bold text-pink-400 tracking-widest uppercase">Creative Studio</span>
        </div>
      </div>

      <button
        onClick={onNewDoc}
        className="w-full py-4 bg-pink-50 border-2 border-dashed border-pink-200 rounded-[1.5rem] text-pink-500 font-bold btn-pop flex items-center justify-center space-x-2 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        <span>New Draft</span>
      </button>

      <div className="flex-grow overflow-y-auto space-y-3 pr-2 scroll-custom">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">My Stories</h3>
        {documents.map((doc) => (
          <div key={doc.id} className="sidebar-item group relative">
            <button
              onClick={() => onSelectDoc(doc.id)}
              className={`w-full text-left p-4 pr-12 rounded-[1.2rem] transition-all duration-300 ${
                activeDocId === doc.id
                  ? 'bg-pink-100 shadow-inner translate-x-1 border border-pink-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`font-bold truncate ${activeDocId === doc.id ? 'text-pink-600' : 'text-gray-700'}`}>
                {doc.title || 'Untitled Magic'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 uppercase">
                {new Date(doc.lastEdited).toLocaleDateString()}
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this draft permanently?")) onDeleteDoc(doc.id);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-white shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-pink-50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Live Now</h3>
        <div className="flex -space-x-2">
          {collaborators.map((c) => (
            <div key={c.id} className="relative btn-pop cursor-pointer group" title={c.name}>
              <img src={c.avatar} className="h-10 w-10 rounded-2xl ring-4 ring-white shadow-sm object-cover" alt={c.name} />
              {c.isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border-2 border-white"></span>}
            </div>
          ))}
          <div className="h-10 w-10 rounded-2xl bg-pink-50 text-pink-400 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">+2</div>
        </div>
      </div>
    </div>
  );
};

const Editor = ({ content, onContentChange, title, onTitleChange }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleAiAction = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    
    // @ts-ignore
    if (window.gsap) {
       // @ts-ignore
       window.gsap.to(".ai-sparkle", { rotation: 360, duration: 1, repeat: -1, ease: "none" });
    }

    const suggestion = await getAIWritingSuggestion(content.slice(-800), aiPrompt);
    
    const newContent = content + (content.length > 0 ? "\n\n" : "") + suggestion;
    onContentChange(newContent);
    setAiPrompt("");
    setIsAiLoading(false);
    
    // @ts-ignore
    if (window.gsap) {
       // @ts-ignore
       window.gsap.killTweensOf(".ai-sparkle");
       // @ts-ignore
       window.gsap.to(".ai-sparkle", { rotation: 0, duration: 0.3 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAiAction();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl border border-pink-100 overflow-hidden relative">
      <div className="px-10 pt-10 pb-4 relative z-10">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-4xl font-bold text-gray-800 focus:outline-none serif placeholder-pink-100 bg-transparent"
          placeholder="Title of your tale..."
        />
        <div className="h-1 w-20 bg-pink-200 rounded-full mt-3"></div>
      </div>

      <div className="flex-grow px-10 pb-24 relative z-10">
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full h-full resize-none focus:outline-none text-xl text-gray-700 leading-relaxed placeholder-gray-200 bg-transparent handwriting"
          placeholder="Once upon a time..."
        />
      </div>

      <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md border border-pink-100 rounded-[2rem] flex items-center space-x-3 shadow-2xl z-20">
        <div className="relative flex-grow group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 ai-sparkle">
            <span className="text-lg">✨</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to 'expand this thought'..."
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-gray-50 border-none focus:ring-2 focus:ring-pink-200 text-sm font-medium text-gray-700"
          />
        </div>
        <button
          onClick={handleAiAction}
          disabled={isAiLoading || !aiPrompt}
          className={`h-14 px-8 rounded-[1.5rem] font-bold text-white transition-all btn-pop flex items-center space-x-2 ${
            isAiLoading ? 'bg-gray-300' : 'bg-gradient-to-r from-pink-400 to-pink-500 shadow-lg'
          }`}
        >
          {isAiLoading ? "..." : "Sync AI"}
        </button>
      </div>
    </div>
  );
};

// --- Main Application ---

const INITIAL_DOCS = [
  {
    id: '1',
    title: 'Welcome ✨',
    content: 'This is your creative space. Type here to begin your story, or use the AI tool below to get inspired!',
    lastEdited: Date.now()
  }
];

const COLLABORATORS = [
  { id: 'u1', name: 'Mochi', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mochi', isOnline: true },
  { id: 'u2', name: 'Luna', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna', isOnline: true },
];

const App = () => {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('inksync_data');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    localStorage.setItem('inksync_data', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const activeDoc = documents.find(d => d.id === activeDocId);

  const handleUpdateContent = (newContent) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocId ? { ...doc, content: newContent, lastEdited: Date.now() } : doc
    ));
  };

  const handleUpdateTitle = (newTitle) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocId ? { ...doc, title: newTitle, lastEdited: Date.now() } : doc
    ));
  };

  const handleCreateNew = () => {
    const newDoc = { id: Date.now().toString(), title: '', content: '', lastEdited: Date.now() };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const handleDeleteDoc = (id) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.id !== id);
      if (activeDocId === id) setActiveDocId(filtered[0]?.id || null);
      return filtered;
    });
  };

  if (showWelcome) {
    return (
      <div className="fixed inset-0 bg-[#fdf6f0] flex items-center justify-center z-50">
        <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🖋️</div>
            <h1 className="text-pink-500 text-5xl font-bold handwriting">InkSync</h1>
            <p className="text-gray-400 font-medium mt-2">Preparing your creative nook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#fdf6f0] overflow-hidden">
      <Sidebar 
        documents={documents} 
        activeDocId={activeDocId} 
        onSelectDoc={setActiveDocId} 
        onNewDoc={handleCreateNew}
        onDeleteDoc={handleDeleteDoc}
        collaborators={COLLABORATORS}
      />
      <main className="flex-grow p-4 md:p-8 flex flex-col relative overflow-hidden">
        <div className="w-full max-w-4xl mx-auto h-full">
          {activeDoc ? (
            <Editor 
              title={activeDoc.title}
              onTitleChange={handleUpdateTitle}
              content={activeDoc.content}
              onContentChange={handleUpdateContent}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <button onClick={handleCreateNew} className="px-12 py-6 bg-pink-500 text-white rounded-3xl font-bold text-xl btn-pop shadow-xl">
                Start a New Story ✨
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
