import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UrlShortener from './components/UrlShortener';
import Story from './components/Story';
import Analytics from './components/Analytics';
import './App.css';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<UrlShortener />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/story" element={<Story />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
