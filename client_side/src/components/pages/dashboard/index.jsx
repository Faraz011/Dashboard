import React, { useState } from 'react';
import Overview from './Overview';
import Resources from './Resources';
import Models from './Models';
import Ideas from './Ideas';
import Chat from './Chat';
import Analytics from './Analytics';
import { auth } from '../../../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Database, Brain, Lightbulb, MessageCircle, PieChart, LogOut, Menu, X } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'resources', label: 'Resources', icon: <Database className="w-5 h-5" /> },
    { id: 'models', label: 'Models', icon: <Brain className="w-5 h-5" /> },
    { id: 'ideas', label: 'Ideas', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <Overview />;
      case 'resources': return <Resources />;
      case 'models': return <Models />;
      case 'ideas': return <Ideas />;
      case 'chat': return <Chat />;
      case 'analytics': return <Analytics />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-lg font-bold text-slate-900">Dashboard</div>
                  <div className="text-xs text-slate-500">Knowledge Base</div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {sidebarOpen && (
                  <span className="font-medium">{tab.label}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
