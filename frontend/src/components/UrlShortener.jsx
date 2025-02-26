import React, { useState, useEffect } from 'react';
import './UrlShortener.css';

const UrlShortener = () => {
    const [url, setUrl] = useState('');
    const [requestCode, setRequestCode] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            // Try native clipboard first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shortUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }

            // Try share API for mobile
            if (navigator.share) {
                await navigator.share({
                    title: 'Shortened URL',
                    text: shortUrl,
                    url: shortUrl,
                });
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }

            // Fallback to legacy clipboard approach
            const textArea = document.createElement('textarea');
            textArea.value = shortUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                setError('Unable to copy to clipboard. Please copy manually.');
            } finally {
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            setError('Failed to share/copy. Please try manually.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate custom string length
        if (requestCode && (requestCode.length < 4 || requestCode.length > 10)) {
            setError('Custom string must be between 4 and 10 characters');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    longUrl: url,
                    requestCode: requestCode || undefined,
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
            }

            setShortUrl(data.url);
            setError('');
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    return (
        <div className="shortener-container">
            <h1 className="title">Shorten it!</h1>
            <form className="shortener-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="url"
                        className="url-input"
                        placeholder="Paste your URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="custom-string-input"
                        placeholder="Custom string (optional)"
                        value={requestCode}
                        onChange={(e) => setRequestCode(e.target.value)}
                        pattern="[A-Za-z0-9]{4,10}"
                        title="4-10 characters (letters and numbers only)"
                    />
                    <button type="submit" className="submit-button">
                        Enter
                    </button>
                </div>
            </form>

            <div className="results-section">
                {error && <p className="error-message">{error}</p>}
                {shortUrl && (
                    <div className="result-container">
                        <h2>Your shortened URL:</h2>
                        <div className="url-display">
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="shortened-url">
                                {shortUrl}
                            </a>
                            <button 
                                className={`copy-button ${copied ? 'copied' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UrlShortener;