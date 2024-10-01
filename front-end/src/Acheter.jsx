import React, { useEffect, useState } from 'react';
import Footer from './components/footer/footer';
import './Acheter.css';

const Acheter = () => {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        // Fetch the properties from the backend where category is 'sell'
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties?category=sell');
                const data = await response.json();
                if (response.ok) {
                    setProperties(data);
                } else {
                    console.error('Failed to fetch properties');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchProperties();
    }, []);

    return (
        <div className="acheter-page">
        
            <main>
                <section className="property-listing-section">
                    <h1>Propriétés à Vendre</h1>
                    <div className="property-grid">
                        {properties.length > 0 ? (
                            properties.map((property) => (
                                <div className="property-card" key={property._id}>
                                    <img src={property.photos[0]} alt={property.title} />
                                    <h2>{property.title}</h2>
                                    <p>{property.description}</p>
                                    <p>Price: {property.price} DH</p>
                                    <p>Surface: {property.surface} m²</p>
                                    <p>Rooms: {property.rooms}</p>
                                    <p>Type: {property.type}</p>
                                    <p>Address: {property.address}</p>
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
