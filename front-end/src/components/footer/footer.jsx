import React from 'react';
import './footer.css'; // Import the CSS file for the footer styling

function Footer() {
    return (
        <div id="footer">
            <div className="footer-section">
                <h3>A propos</h3>
                <p>Bienvenue sur Immobilier, votre destination incontournable pour toutes vos besoins en immobilier. Que vous soyez à la recherche d'une nouvelle maison, d'un appartement moderne, ou d'un investissement rentable, notre plateforme est conçue pour vous offrir une expérience de recherche intuitive et efficace.</p>
            </div>
            <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/acheter">Acheter</a></li>
                    <li><a href="/louer">Louer</a></li>
                    <li><a href="/vendre">Vendre</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Contacter nous</h3>
                <p>Email: immobiliercomp@gmail.com</p>
                <p>Phone: +6 779 943 556</p>
                <p>Address: 123 Gueliz , Marrakech, Morocco</p>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Immobilier. All Rights Reserved.</p>
            </div>
        </div>
    );
}

export default Footer;
