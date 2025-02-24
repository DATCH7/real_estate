import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './components/footer/footer';
import './Louer.css';

const Louer = () => {
    const [properties, setProperties] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('token');
        if (!isLoggedIn) {
            navigate('/login');
        }

        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties/category/rent');
                const data = await response.json();
                setProperties(data);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            }
        };

        fetchProperties();
    }, [navigate]);

    return (
        <div className="louer-page">
            <main>
                <section className="property-listing-section">
                    <h1>Propriétés à Louer</h1>
                    <div className="property-grid">
                        {properties.length === 0 ? (
                            <p>Aucune propriété disponible à louer.</p>
                        ) : (
                            properties.map((property) => (
                                <div className="property-card" key={property._id}>
                                    {property.photos && property.photos.length > 0 && (
                                        <img
                                            src={`http://localhost:5000/uploads/${property.photos[0]}`} // Display the first image
                                            alt={property.title}
                                            className="property-image"
                                        />
                                    )}
                                    <h2>{property.title}</h2>
                                    <p>{property.description}</p>
                                    <p>Prix: {property.price} DH</p>
                                    <p>Superficie: {property.surface} m²</p>
                                    <p>Nombre de pièces: {property.rooms}</p>
                                    <p>Type: {property.type}</p>
                                    <p>Adresse: {property.address}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Louer;
