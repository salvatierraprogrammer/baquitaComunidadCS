import React, { useState, useEffect } from 'react';
import '../assets/css/Home.css';
import ButtonDona from '../component/ButtonDona';
import { useGetDonacionesQuery } from '../service/ecApi';
import Loading from '../component/Loading';
import md5 from 'md5';

function getRandomGravatarImage() {
  const randomString = Math.random().toString(36).substring(7); // Genera una cadena aleatoria
  const hash = md5(randomString); // Genera el hash MD5 de la cadena
  return `https://www.gravatar.com/avatar/${hash}?d=retro`; // Devuelve la URL con el hash
}

// Define the type for a donation
interface Donacion {
  id: string;
  nombre: string;
  cantidad: string; // Adjust the type if needed (e.g., number)
}

function Home() {
  // Fetch donations with hooks
  const { data: donaciones = [], error, isLoading } = useGetDonacionesQuery();
  const [totalRecaudado, setTotalRecaudado] = useState(0);
  const LIMITE_RECAUDADO = 50000; // Limit of 50,000 ARS

  useEffect(() => {
    if (donaciones.length > 0) {
      calcularTotalRecaudado(donaciones);
    }
  }, [donaciones]);

  // Calculate the total amount raised
  const calcularTotalRecaudado = (donaciones: Donacion[]) => {
    let total = 0;
    for (let donacion of donaciones) {
      total += parseFloat(donacion.cantidad);
      if (total >= LIMITE_RECAUDADO) {
        total = LIMITE_RECAUDADO;
        break; // Stop the sum when reaching the limit
      }
    }
    setTotalRecaudado(total);
  };

  if (isLoading) return <Loading />;
  if (error) return <p>Error al cargar donaciones revise su conexion: {error.message}</p>;

  return (
    <div className="home-container">
      <header className="header">
        <h1>¡Baquita para gomito!</h1>
        <p className="subtitle">Ayudemos a nuestro compañero</p>
        <p className="community">De la comunidad Alta Fruta</p> {/* Added here */}
      </header>
      <section className="server-info">
      
        <h3>Comunidad Alta Fruta <a href="https://www.altafruta.net/" target="_blank" rel="noopener noreferrer">aquí</a></h3>
        <p><strong>Servidor IP:</strong> 45.235.98.120:27025</p>
      </section>
      <main className="main-content">
        <section className="goal">
          <h2>Objetivo: $50.000 ARS</h2>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${(totalRecaudado / LIMITE_RECAUDADO) * 100}%` }}></div>
          </div>
          <p>Recaudado: ${totalRecaudado.toFixed(2)} ARS</p>
        </section>

        <section className="description">
          <p>
            Estamos organizando una Baquita para ayudar a nuestro compañero gomito a
            comprar un micrófono nuevo para disfrutar de sus partidas en Counter-Strike 1.6.
            Tu aporte es muy valioso. ¡Cualquier cantidad ayuda!
          </p>
        </section>

        <section className="product-info">
          <h3>Baquita Profesional</h3>
          <img 
            src="https://http2.mlstatic.com/D_NQ_NP_711227-MLU72827408746_112023-O.webp" 
            alt="Micrófono Profesional para Streaming" 
            className="product-image"
          />
          <p>
            Puedes comprar el micrófono <a href="https://www.mercadolibre.com.ar/microfono-profesional-condesador-condenser-brazo-articulado-color-plateado-con-negro/p/MLA23312246?item_id=MLA1571016750" target="_blank" rel="noopener noreferrer">aquí</a>.
          </p>
        </section>

        <section className="donantes">
          <h3>Donantes:</h3>
          <div className="donantes-container">
            {donaciones.map((donacion: Donacion) => {
              const imagenAleatoria = getRandomGravatarImage(); // Usa la función para generar una imagen aleatoria
              return (
                <div className="donante-badge" key={donacion.id}>
                  <div className="image-circle">
                    <img src={imagenAleatoria} alt={`Donante ${donacion.nombre}`} />
                  </div>
                  <span>{donacion.nombre}</span>
                </div>
              );
            })}
          </div>
        </section>

        {totalRecaudado < LIMITE_RECAUDADO ? (
          <ButtonDona />
        ) : (
          <p>¡Lo logramos! Hemos llegado a nuestro objetivo.</p>
        )}
      </main>

      <footer className="footer">
        <p>Gracias por tu apoyo. ¡Vamos por más!</p>
      </footer>
    </div>
  );
}

export default Home;