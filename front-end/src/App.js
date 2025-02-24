import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './home.jsx';
import Login from './components/login/login';
import Vendre from './Vendre.jsx';
import Acheter from './Acheter.jsx';
import Louer from './Louer.jsx';
import Favoris from './Favoris.jsx';
import Account from './components/account/Account';
import 'font-awesome/css/font-awesome.min.css';
import SignUp from './components/signup/signup.jsx';
import AdminPanel from './admin.jsx'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const checkAuth = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/checkAuth', {
            credentials: 'include',
        });
        const data = await response.json();
        setIsLoggedIn(data.loggedIn);
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
        <Header isLoggedIn={isLoggedIn} />  
      <Routes>
        <Route path="/" element={<Home />} />   
        <Route path="/account" element={<Account setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/vendre" element={<Vendre />} />
        <Route path="/Acheter" element={<Acheter />} />
        <Route path="/louer" element={<Louer />} /> 
        <Route path="/Favoris" element={<Favoris />} /> 
      </Routes>
    </Router>
  );
};  

export default App;
