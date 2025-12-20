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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

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
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">AI Team Dashboard</div>
        <nav className="sidebar-nav">
          {['overview', 'resources', 'models', 'ideas', 'chat', 'analytics'].map(tab => (
            <button 
              key={tab} 
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button className="nav-item logout" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
