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
                const response = await fetch('http://localhost:5000/api/properties?category=rent');
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
                <section className="louer-section">
                    <div className="louer-content">
                        <h1>Propriétés à Louer</h1>
                        {properties.length === 0 ? (
                            <p>Aucune propriété disponible à louer.</p>
                        ) : (
                            <ul>
                                {properties.map(property => (
                                    <li key={property._id}>
                                        <h2>{property.title}</h2>
                                        <p>{property.description}</p>
                                        <p>Prix: {property.price} DH</p>
                                        <p>Superficie: {property.surface} m²</p>
                                        <p>Nombre de pièces: {property.rooms}</p>
                                        <p>Type: {property.type}</p>
                                        <p>Adresse: {property.address}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Louer;
