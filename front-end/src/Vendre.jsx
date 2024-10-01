import React, { useState } from 'react';
import Footer from './components/footer/footer';
import './Vendre.css';

const Vendre = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        surface: '',
        rooms: '',
        type: '',
        address: '',
        category: 'sell', // Default option for sell or rent
        photos: [], // Array to handle multiple photos
        diagnostics: '',
        equipment: ''
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'photos') {
            // Handle file input
            setFormData({
                ...formData,
                [name]: Array.from(files) // Convert FileList to array
            });
        } else {
            // Prevent negative values for price, surface, and rooms
            if ((name === 'price' || name === 'surface' || name === 'rooms') && value < 0) {
                return; // Do nothing if the value is negative
            }
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        // Append form fields to FormData
        Object.keys(formData).forEach(key => {
            if (key === 'photos') {
                formData.photos.forEach((file, index) => {
                    formDataToSend.append('photos', file);
                });
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        try {
            const response = await fetch('http://localhost:5000/api/properties', {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();

            if (response.ok) {
                alert('Property published successfully!');
                // Clear form data after successful submission if desired
                setFormData({
                    title: '',
                    description: '',
                    price: '',
                    surface: '',
                    rooms: '',
                    type: '',
                    address: '',
                    category: 'sell',
                    photos: [],
                    diagnostics: '',
                    equipment: ''
                });
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('There was an error submitting the property:', error);
            alert('Submission failed. Please try again.');
        }
    };

    return (
        <div className="vendre-page">
            <main>
                <section className="vendre-section">
                    <div className="vendre-content">
                        <h1>Publish Your Property</h1>
                        <form className='vendre-form' onSubmit={handleSubmit}>
                            <div className="vendre-input-group">
                                <label htmlFor="title">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="description">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="price">Price (DH)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="surface">Surface Area (m²)</label>
                                <input
                                    type="number"
                                    name="surface"
                                    value={formData.surface}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="rooms">Number of Rooms</label>
                                <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="type">Type</label>
                                <input type="text" name="type" value={formData.type} onChange={handleChange} />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="category">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="sell">Sell</option>
                                    <option value="rent">Rent</option>
                                </select>
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="address">Full Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="photos">Photos</label>
                                <input
                                    type="file"
                                    name="photos"
                                    multiple
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="diagnostics">Diagnostics</label>
                                <input type="text" name="diagnostics" value={formData.diagnostics} onChange={handleChange} />
                            </div>
                            <div className="vendre-input-group">
                                <label htmlFor="equipment">Equipment</label>
                                <input type="text" name="equipment" value={formData.equipment} onChange={handleChange} />
                            </div>
                            <button className='vendre-button' type="submit">Publish</button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Vendre;
