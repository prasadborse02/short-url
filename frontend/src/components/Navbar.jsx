import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-content">
                <Link to="/" className="nav-brand">shortUrl</Link>
                
                {/* Mobile menu button */}
                <button 
                    className="mobile-menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </button>

                {/* Navigation items */}
                <div className={`nav-items ${isMenuOpen ? 'show' : ''}`}>
                    <Link 
                        to="/" 
                        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/analytics" 
                        className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Analytics
                    </Link>
                    <Link 
                        to="/story" 
                        className={`nav-item ${location.pathname === '/story' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Story
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
