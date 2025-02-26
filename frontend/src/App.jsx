import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UrlShortener from './components/UrlShortener';
import Story from './components/Story';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<UrlShortener />} />
                        <Route path="/analytics" element={<div>Analytics Coming Soon...</div>} />
                        <Route path="/story" element={<Story />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
