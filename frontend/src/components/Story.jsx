import React from 'react';
import './Story.css';

const Story = () => {
    return (
        <div className="story-container">
            <h1>Why shortUrl, Prasad?</h1>
            
            <section className="story-section">
                <h2>The Story</h2>
                <p>
                    During my college days, I frequently shared my assignments and study materials 
                    with fellow students. These resources would often spread beyond my immediate 
                    circle, passed from one student to another. While I was happy to help others 
                    learn, I had no way to track how many students actually benefited from these 
                    materials or which resources were most helpful. This experience stuck with me.
                </p>
                <p>
                    Now, as a hobby project, I've built AssignShare Analytics to solve this exact 
                    problem I once faced. It's a URL shortener with a twist - focusing on making 
                    shared resources both easily accessible and trackable.
                </p>
            </section>

            <section className="story-section">
                <h2>Technical Implementation</h2>
                <div className="implementation-details">
                    <h3>Core Data Flow</h3>
                    <ul>
                        <li>Save URL mapping to SQL (persistent storage)</li>
                        <li>Cache URL mapping in Redis (for fast lookups)</li>
                        <li>Send click events to Kafka for processing</li>
                        <li>Store analytics in both Redis (real-time) and SQL (historical)</li>
                    </ul>

                    <h3>Key Technologies</h3>
                    <ul>
                        <li>Redis: Fast URL lookups and real-time stats</li>
                        <li>SQL: Persistent storage and historical data</li>
                        <li>Kafka: Decoupled event processing</li>
                        <li>Node.js: Backend API and services</li>
                    </ul>

                    <h3>Features</h3>
                    <ul>
                        <li>Custom memorable URLs</li>
                        <li>Real-time click tracking</li>
                        {/* <li>Geographic analytics</li> */}
                        <li>Usage statistics dashboard</li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Story;
