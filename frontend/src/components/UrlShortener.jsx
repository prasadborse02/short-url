import React, { useState } from 'react';
import './UrlShortener.css';

const UrlShortener = () => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement URL shortening logic
    console.log('URL to shorten:', url);
  };

  return (
    <div className="shortener-container">
      <h1 className="title">Shorten it!</h1>
      <form className="shortener-form" onSubmit={handleSubmit}>
        <input
          type="url"
          className="url-input"
          placeholder="Paste your URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          Enter
        </button>
      </form>
    </div>
  );
};

export default UrlShortener;
