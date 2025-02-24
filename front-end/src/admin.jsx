import React, { useEffect, useState } from 'react';
import Footer from './components/footer/footer'; // Import the Footer component
import './Admin.css'; // Import the CSS for styling

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch users on component load
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5000/api/users', { credentials: 'include' });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                
                // Separate users and admins based on role
                const usersList = data.filter(user => user.role === 'user');
                const adminsList = data.filter(user => user.role === 'admin');

                setUsers(usersList);  // Set users list
                setAdmins(adminsList);  // Set admins list
            } catch (error) {
                setError(error.message); // Set error message
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Function to promote or demote a user
    const handleRoleChange = async (userId, newRole) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/users/role/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials for session
                body: JSON.stringify({ role: newRole }), // Update role
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                
                // Update local state optimistically
                if (newRole === 'admin') {
                    setUsers(users.filter(user => user._id !== userId));
                    setAdmins([...admins, { ...users.find(user => user._id === userId), role: newRole }]);
                } else {
                    setAdmins(admins.filter(admin => admin._id !== userId));
                    setUsers([...users, { ...admins.find(admin => admin._id === userId), role: newRole }]);
                }
            } else {
                const errorData = await response.json();
                setError('Error changing user role: ' + errorData.message);
            }
        } catch (error) {
            setError('Error changing user role: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to delete a user
    const handleDeleteUser = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials for session
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                // Remove the deleted user from local state
                setUsers(users.filter(user => user._id !== userId));
            } else {
                const errorData = await response.json();
                setError('Error deleting user: ' + errorData.message);
            }
        } catch (error) {
            setError('Error deleting user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                window.location.href = '/login'; // Redirect to login page
            } else {
                alert('Error logging out');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="admin-panel-page">
            <h1 className="admin-panel-title">Admin Panel</h1>

            {loading && <p>Loading...</p>} {/* Loading state */}
            {error && <p className="error-message">{error}</p>} {/* Display error messages */}

            {/* Users Section */}
            <section className="admin-users-section">
                <h2 className="admin-section-title">Users</h2>
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button 
                                        className="admin-promote-button" 
                                        onClick={() => handleRoleChange(user._id, 'admin')}>
                                        Promote to Admin
                                    </button>
                                    <button 
                                        className="admin-delete-button" 
                                        onClick={() => handleDeleteUser(user._id)}>
                                        Delete User
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Admins Section */}
            <section className="admin-admins-section">
                <h2 className="admin-section-title">Admins</h2>
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin._id}>
                                <td>{admin.firstName} {admin.lastName}</td>
                                <td>{admin.email}</td>
                                <td>{admin.role}</td>
                                <td>
                                    <button 
                                        className="admin-demote-button" 
                                        onClick={() => handleRoleChange(admin._id, 'user')}>
                                        Demote to User
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <button onClick={handleLogout} className="admin-logout-button">Logout</button> {/* Logout button at bottom */}       
        </div>
        
    );
};

export default AdminPanel;
