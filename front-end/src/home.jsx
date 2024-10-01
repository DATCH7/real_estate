import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './components/footer/footer';
import './home.css';

function Home() {
    return (
        <div className="home-page">

            <main>
                <section className="home-section">
                    <div className="home-content">
                        <h1>Trouvez Votre Maison de Rêve</h1>
                        <p>Votre propriété parfaite est à seulement une recherche de distance.</p>
                        <input type="text" placeholder="Search by location, price, etc." />
                        <button id="search-home">Search</button>
                    </div>
                </section>
                {/* Additional content */}
            </main>
            <Footer />
        </div>
    );
}

export default Home;
