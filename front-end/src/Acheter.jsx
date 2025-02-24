import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons'; // Solid star for favorited
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons'; // Regular star for unfavorited
import Footer from './components/footer/footer';
import './Acheter.css'; // Ensure to import the CSS file

const Acheter = () => {
    const [properties, setProperties] = useState([]);
    const [favorites, setFavorites] = useState({}); // Store favorite status of each property

    useEffect(() => {
        // Fetch the properties from the backend where category is 'sell'
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties/category/sell');
                const data = await response.json();
                if (response.ok) {
                    setProperties(data);
                    // Initialize favorites state with properties fetched
                    const initialFavorites = {};
                    data.forEach(property => {
                        initialFavorites[property._id] = false; // All properties are initially not favorited
                    });
                    setFavorites(initialFavorites);
                } else {
                    console.error('Failed to fetch properties');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchProperties();
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
                console.log(`Property ${propertyId} favorite status changed to: ${!isFavorited}`);
            } else {
                console.error('Failed to update favorites');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <div className="acheter-page">
            <main>
                <section className="property-listing-section">
                    <h1>Propriétés à Vendre</h1>
                    <div className="property-grid">
                        {properties.length > 0 ? (
                            properties.map((property) => (
                                <div className="property-card" key={property._id}>
                                    <img src={`http://localhost:5000/uploads/${property.photos[0]}`} alt={property.title} />
                                    <h2>{property.title}</h2>
                                    <p>{property.description}</p>
                                    <p>Price: {property.price} DH</p>
                                    <p>Surface: {property.surface} m²</p>
                                    <p>Rooms: {property.rooms}</p>
                                    <p>Type: {property.type}</p>
                                    <p>Address: {property.address}</p>
                                    <div className="favorite-icon"  onClick={() => handleFavorite(property._id)}   >
                                 <FontAwesomeIcon icon={favorites[property._id] ? solidStar : regularStar} style={{ color: favorites[property._id] ? 'gold' : 'gray' }} />
                                </div>
                                </div>
                            ))
                        ) : (
                            <p>Aucune propriété disponible à la vente.</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Acheter;
