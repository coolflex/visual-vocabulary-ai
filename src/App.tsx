import React, { useState } from 'react'
import { Sparkles, BookOpen, Flame, ArrowLeft, Award, Search, ChevronsRight, Headphones, Gamepad2, ScanLine, Settings, MessageSquare } from 'lucide-react'

// Simple inline components to make the app functional
function Dashboard({ onSelectView }: { onSelectView: (view: string) => void }) {
  const features = [
    { name: 'Interactive Learning', icon: BookOpen, view: 'interactive', desc: 'Learn through visual experiences' },
    { name: 'Audio Practice', icon: Headphones, view: 'audio', desc: 'Perfect your pronunciation' },
    { name: 'AI Assistant', icon: MessageSquare, view: 'ai', desc: 'Ask questions, get answers' },
    { name: 'Quiz Games', icon: Gamepad2, view: 'quiz', desc: 'Test your knowledge' },
    { name: 'Image Scanner', icon: ScanLine, view: 'scanner', desc: 'Learn from real objects' },
    { name: 'Settings', icon: Settings, view: 'admin', desc: 'Customize your experience' },
  ]
  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Choose a learning mode to get started</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(f => (
          <button key={f.view} onClick={() => onSelectView(f.view)}
            className="p-6 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-all border border-slate-700 hover:border-blue-500">
            <f.icon className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-lg">{f.name}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
            <ChevronsRight className="w-5 h-5 text-blue-400 mt-2" />
          </button>
        ))}
      </div>
    </div>
  )
}

function GenericView({ title, icon: Icon, description, onBack }: { title: string; icon: any; description: string; onBack: () => void }) {
  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-400 mb-6 hover:text-blue-300">
        <ArrowLeft size={20} /><span>Back to Dashboard</span>
      </button>
      <Icon className="w-12 h-12 text-blue-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-slate-400 mb-8">{description}</p>
      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
        <p className="text-slate-300">This module is being developed. Check back soon for the full experience!</p>
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('landing')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectView={setCurrentView} />
      case 'interactive':
        return <GenericView title="Interactive Learning" icon={BookOpen} description="Learn vocabulary through beautiful interactive visual scenes." onBack={() => setCurrentView('dashboard')} />
      case 'audio':
        return <GenericView title="Audio Practice" icon={Headphones} description="Practice pronunciation with AI-powered audio feedback." onBack={() => setCurrentView('dashboard')} />
      case 'ai':
        return <GenericView title="AI Assistant" icon={MessageSquare} description="Ask questions about vocabulary and get instant AI answers." onBack={() => setCurrentView('dashboard')} />
      case 'quiz':
        return <GenericView title="Quiz Games" icon={Gamepad2} description="Test your knowledge with fun interactive quizzes." onBack={() => setCurrentView('dashboard')} />
      case 'scanner':
        return <GenericView title="Image Scanner" icon={ScanLine} description="Point your camera at objects to learn vocabulary in real-time." onBack={() => setCurrentView('dashboard')} />
      case 'admin':
        return <GenericView title="Settings" icon={Settings} description="Customize your learning experience and preferences." onBack={() => setCurrentView('dashboard')} />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            <div className="text-center max-w-2xl px-6">
              <h1 className="text-6xl font-bold mb-4">Visual Vocabulary AI</h1>
              <p className="text-xl text-blue-200 mb-8">Interactive AI-powered visual language learning platform. Learn vocabulary through images, audio, and interactive experiences.</p>
              <button onClick={() => setCurrentView('dashboard')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50">
                Get Started
              </button>
              <div className="mt-12 flex justify-center gap-8 text-blue-300">
                <div className="text-center"><Sparkles className="mx-auto mb-2 w-8 h-8" /><span>AI-Powered</span></div>
                <div className="text-center"><BookOpen className="mx-auto mb-2 w-8 h-8" /><span>Visual Learning</span></div>
                <div className="text-center"><Flame className="mx-auto mb-2 w-8 h-8" /><span>Interactive</span></div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {currentView !== 'landing' && (
        <nav className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
          <button onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft size={20} /><span>Home</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-yellow-400">
              <Award size={18} /><span>0 XP</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={18} /><span>0</span>
            </div>
          </div>
        </nav>
      )}
      {renderView()}
    </div>
  )
}

export default App
