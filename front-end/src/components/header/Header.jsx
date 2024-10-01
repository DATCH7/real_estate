import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header({ isLoggedIn }) {
    return (
        <div id="header">
            <div id="logo">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="first">I</span> <span className="last">mmobilier</span>
                </Link>
            </div>
            <div id="actions-container">
                <Link to="/acheter"><button id="acheter">Acheter</button></Link>
                <Link to="/louer"><button id="louer">Louer</button></Link>
                <Link to="/vendre"><button id="vendre">Vendre</button></Link>
                <Link to="/APropos"><button id="A propos">A propos</button></Link>
                <Link to="/Favoris"><button id="favoris">Mes favoris</button></Link>
            </div>
            {/* Conditional rendering for Login or Account */}
            {isLoggedIn ? (
                <Link to="/account">
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                </Link>
            ) : (
                <Link to="/login">
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                </Link>
            )}
        </div>
    );
}

export default Header;
