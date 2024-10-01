import React, { useState, useEffect } from 'react';
import Footer from './components/footer/footer';
import './Favoris.css'; // We'll create the CSS for this later

const Favoris = () => {
    const [favoris, setFavoris] = useState([]);

    useEffect(() => {
        // Fetch the user's favorite publications from the backend
        const fetchFavoris = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/favorites'); // Replace with your API endpoint
                const data = await response.json();
                setFavoris(data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavoris();
    }, []);

    return (
        <div>
           
            <div className="favoris-container">
                <h2>Mes Favoris</h2>
                {favoris.length === 0 ? (
                    <p>Aucun favori trouvé.</p>
                ) : (
                    <div className="favoris-list">
                        {favoris.map((favori) => (
                            <div key={favori._id} className="favori-item">
                                <h3>{favori.title}</h3>
                                <p>{favori.description}</p>
                                <p><strong>Prix:</strong> {favori.price} €</p>
                                {/* Add more details as needed */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Favoris;
