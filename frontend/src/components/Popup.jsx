import React from 'react';
import './Popup.css';

const Popup = ({ onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>×</button>
                <img src="meme.png" alt="Meme" className="popup-image" />
            </div>
        </div>
    );
};

export default Popup;
