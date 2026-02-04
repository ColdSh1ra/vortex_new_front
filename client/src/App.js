import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderMain from './components/HeaderMain';

// Dummy components for now
const Home = () => <div><h2>Home Page Content</h2></div>;
const Services = () => <div><h2>Our Services</h2></div>;

function App() {
  return (
    <Router>
      {/* The Header is outside Routes, so it stays fixed while pages change! */}
      <HeaderMain /> 
      
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;