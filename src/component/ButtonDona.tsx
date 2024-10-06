import React, { useState } from 'react';
import ModalDonar from './ModalDonar'; // Asegúrate de importar el modal

function ButtonDona() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="donate">
      <h3>¡Haz tu donación!</h3>
      <button className="donate-button" onClick={handleOpenModal}>Donar</button>
      <ModalDonar isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
}

export default ButtonDona;