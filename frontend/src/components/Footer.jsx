import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="copyright">
                    © {new Date().getFullYear()} shortUrl. All rights reserved.
                </div>
                <div className="social-links">
                    <a href="https://www.linkedin.com/in/borseprasad/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="LinkedIn">
                        <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://github.com/prasadborse02" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="GitHub">
                        <i className="fab fa-github"></i>
                    </a>
                    <a href="https://x.com/luminary_lummox" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       aria-label="X (Twitter)">
                        <i className="fab fa-x-twitter"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
