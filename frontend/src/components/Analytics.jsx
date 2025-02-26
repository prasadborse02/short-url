import React, { useState } from 'react';
import './Analytics.css';

function Analytics() {
    const [shortUrl, setShortUrl] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState('');

    const fetchAnalytics = async (e) => {
        e.preventDefault();
        try {
            // Construct the full short URL if only code is provided
            const fullShortUrl = shortUrl.includes('http') ? shortUrl : `${import.meta.env.VITE_API_URL}/l/${shortUrl}`;
            
            // Create the jsonQuery parameter
            const jsonQuery = encodeURIComponent(JSON.stringify({ shortUrl: fullShortUrl }));
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics?jsonQuery=${jsonQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            setAnalytics(data);
            setError('');
        } catch (err) {
            setError(`Failed to fetch analytics: ${err}`);
            setAnalytics(null);
        }
    };

    return (
        <div className="analytics-container">
            <h2 className="analytics-title">URL Analytics Dashboard</h2>
            
            <div className="search-section">
                <form onSubmit={fetchAnalytics}>
                    <input
                        type="text"
                        value={shortUrl}
                        onChange={(e) => setShortUrl(e.target.value)}
                        placeholder="Enter short URL or code"
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        Analyze URL
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {analytics && (
                <div className="dashboard">
                    <div className="url-card">
                        <h3>URL Information</h3>
                        <div className="url-details">
                            <div className="detail-row">
                                <span className="label">Original URL:</span>
                                <a href={analytics.originalUrl} target="_blank" rel="noopener noreferrer" className="url-link">
                                    {analytics.originalUrl}
                                </a>
                            </div>
                            <div className="detail-row">
                                <span className="label">Created:</span>
                                <span>{new Date(analytics.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{analytics.analytics.totalSessions}</div>
                            <div className="stat-label">Total Sessions</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analytics.analytics.activeDays}</div>
                            <div className="stat-label">Active Days</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analytics.analytics.avgSessionsPerDay.toFixed(1)}</div>
                            <div className="stat-label">Avg Sessions/Day</div>
                        </div>
                        {/* <div className="stat-card">
                            <div className="stat-value">{analytics.analytics.repeatVisitors}</div>
                            <div className="stat-label">Repeat Visitors</div>
                        </div> */}
                    </div>

                    <div className="details-grid">
                        <div className="detail-section">
                            <h3>Geographic Distribution</h3>
                            <div className="distribution-list">
                                {Object.entries(analytics.analytics.geographicDistribution)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([location, count]) => (
                                        <div key={location} className="distribution-item">
                                            <span>{location}</span>
                                            <span className="count">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Engagement Metrics</h3>
                            <div className="engagement-list">
                                <div className="engagement-item">
                                    <span className="metric-label">Total Clicks</span>
                                    <div className="metric-value">
                                        {analytics.analytics.engagementPatterns.totalClicks}
                                    </div>
                                </div>
                                <div className="engagement-item">
                                    <span className="metric-label">Unique Sessions</span>
                                    <div className="metric-value">
                                        {analytics.analytics.engagementPatterns.uniqueSessions}
                                    </div>
                                </div>
                                <div className="engagement-item">
                                    <span className="metric-label">Clicks Per Session</span>
                                    <div className="metric-value">
                                        {analytics.analytics.engagementPatterns.clicksPerSession}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analytics;
