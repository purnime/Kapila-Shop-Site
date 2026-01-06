import React from 'react';

const About = () => {
    return (
        <div className="container section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h1 className="section-title">About Kapila Stores</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>
                    Kapila Stores has been serving the community for over 10 years.
                    We are dedicated to providing fresh, high-quality products at the best prices.
                    Our mission is to make daily shopping convenient and enjoyable for everyone.
                </p>
            </div>
        </div>
    );
};

export default About;
