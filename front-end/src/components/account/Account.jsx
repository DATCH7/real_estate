import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../footer/footer';
import './Account.css';

const Account = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getUserData', {
                    method: 'GET',
                    credentials: 'include',
                });

                console.log('User Data Response:', response);
                if (!response.ok) {
                    throw new Error('Error fetching user data: ' + response.status);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Fetch User Data Error:', error);
                if (error.message.includes('401')) {
                    navigate('/login'); // Redirect if unauthorized
                } else {
                    alert('An error occurred while fetching user data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                credentials: 'include', // Send cookies with the request
            });

            if (response.ok) {
                navigate('/login'); // Redirect to login page after successful logout
            } else {
                throw new Error('Logout failed: ' + response.status);
            }
        } catch (error) {
            console.error('Logout Error:', error);
            alert('An error occurred during logout. Please try again later.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="acc-container">
            <div className="acc-header">
                <h1>Account</h1>
            </div>
            {user ? (
                <div className="acc-info">
                    <p>First Name: {user.firstName}</p>
                    <p>Last Name: {user.lastName}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
            <div className="acc-logout">
                <button className="logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default Account;
