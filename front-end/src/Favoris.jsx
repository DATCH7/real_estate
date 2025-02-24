import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons'; // Solid star for favorited
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'; // Regular star for unfavorited
import Footer from './components/footer/footer';
import './Favoris.css'; // Ensure to import the CSS file

const Favoris = () => {
    const [favoris, setFavoris] = useState([]);
    const [favorites, setFavorites] = useState({}); // Store favorite status of each property

    useEffect(() => {
        // Fetch the user's favorite publications from the backend
        const fetchFavoris = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/favorite'); // Replace with your API endpoint
                const data = await response.json();

                // Check if data is an array before setting it
                if (Array.isArray(data)) {
                    setFavoris(data);
                    // Initialize favorites state with fetched favoris
                    const initialFavorites = {};
                    data.forEach(favori => {
                        initialFavorites[favori._id] = true; // All fetched favoris are favorited
                    });
                    setFavorites(initialFavorites);
                } else {
                    console.error('Expected an array, but got:', data);
                    setFavoris([]);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavoris(); 
    }, []);

    const handleFavorite = async (propertyId) => {
        try {
            const isFavorited = favorites[propertyId];
            const method = isFavorited ? 'DELETE' : 'POST'; // Use DELETE if already favorited

            const response = await fetch(`http://localhost:5000/api/favorite`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Send session cookies with the request
                body: JSON.stringify({ propertyId }),
            });

            if (response.ok) {
                // Update the favorite state
                setFavorites((prev) => ({
                    ...prev,
                    [propertyId]: !isFavorited, // Toggle favorite status
                }));
                console.log(`Favorite status changed for property ${propertyId}`);
            } else {
                console.error('Failed to update favorites');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="favoris-page">
            <main>
                <section className="property-listing-section">
                    <h1>Mes Favoris</h1>
                    <div className="property-grid">
                        {favoris.length > 0 ? (
                            favoris.map((favori) => (
                                <div className="property-card" key={favori._id}>
                                    <img src={`http://localhost:5000/${favori.photos[0]}`} alt={favori.title} />
                                    <h2>{favori.title}</h2>
                                    <p>{favori.description}</p>
                                    <p>Prix: {favori.price} DH</p>
                                    <p>Surface: {favori.surface} m²</p>
                                    <p>Rooms: {favori.rooms}</p>
                                    <p>Type: {favori.type}</p>
                                    <p>Address: {favori.address}</p>
                                    <div className="favorite-icon" onClick={() => handleFavorite(favori._id)}>
                                        <FontAwesomeIcon icon={favorites[favori._id] ? solidStar : regularStar} style={{ color: favorites[favori._id] ? 'gold' : 'gray' }} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Aucun favori trouvé.</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Favoris;
