import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true); // New loading state
    const navigate = useNavigate();

    // Check if user is already authenticated on component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/checkAuth', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Update login state if already authenticated
                if (data.isAuthenticated) {
                    setIsLoggedIn(true);
                    // Redirect based on user role
                    if (data.user.role === 'admin') {
                        navigate('/admin'); // Redirect to admin panel
                    } else {
                        navigate('/'); // Redirect to home page
                    }
                }
            } catch (error) {
                console.error('Authentication check error:', error);
            } finally {
                setIsLoading(false); // Set loading to false after the check
            }
        };

        checkAuth();
    }, [navigate, setIsLoggedIn]);

    // Handle form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Reset error message

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                setIsLoggedIn(true); // Update login state in parent component
                setEmail(''); // Reset email field
                setPassword(''); // Reset password field
                // Redirect based on user role
                if (data.user.role === 'admin') {
                    navigate('/admin'); // Redirect to admin panel
                } else {
                    navigate('/'); // Redirect to home page on success
                }
            } else {
                setErrorMessage(data.message); // Display error from server
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

    // Show loading state if checking authentication
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="login-container">
            <form className='login-form' onSubmit={handleSubmit}>
                <h2>Login</h2>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className='log-button' type="submit">Login</button>
                <button type="button" className="redirect-button" onClick={() => navigate('/signup')}>
                    Don't have an account? Sign up here
                </button>
            </form>
        </div>
    );
};

export default Login;
