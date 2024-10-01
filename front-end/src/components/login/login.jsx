import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Check if user is already authenticated on component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/checkAuth', {
                    method: 'GET',
                    credentials: 'include', // Ensure cookies are sent
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                
                // Update login state if already authenticated
                if (data.isAuthenticated) {
                    console.log('User is already authenticated');
                    setIsLoggedIn(true); // Set logged in state
                    navigate('/'); // Redirect to home page
                } else {
                    console.log('User is not authenticated');
                }
            } catch (error) {
                console.error('Authentication check error:', error);
            }
        };
    
        checkAuth(); // Call the checkAuth function
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
                credentials: 'include', // Ensure session cookies are sent
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response:', data); // Log the response

            if (data.success) {
                setIsLoggedIn(true); // Update login state in parent component
                setEmail(''); // Reset email field
                setPassword(''); // Reset password field
                navigate('/'); // Redirect to home page on success
            } else {
                setErrorMessage(data.message); // Display error from server
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('An unexpected error occurred. Please try again later.');
        }
    };

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
