import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvestigationPage from './pages/InvestigationPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/investigation" element={<InvestigationPage />} />
        {/* Add routes for other pages when they're implemented */}
        <Route path="/alerts" element={<div className="ml-64 p-8 text-white">Alerts Center Page (Coming Soon)</div>} />
        <Route path="/analytics" element={<div className="ml-64 p-8 text-white">Analytics Page (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
