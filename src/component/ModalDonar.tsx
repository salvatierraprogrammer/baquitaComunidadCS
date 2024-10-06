import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAddDonacionMutation } from '../service/ecApi';
import { storage } from '../Confg/firebase';
import '../../public/css/ModalDonar.css';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

function ModalDonar({ isOpen, onClose, usuario }) {
  const [cantidad, setCantidad] = useState('');
  const [factura, setFactura] = useState(null);
  const [nombre, setNombre] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addDonacion] = useAddDonacionMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setError('');
    setIsLoading(true);
    try {
      let urlPdf = '';
  
      if (factura) {
        const uniqueId = uuidv4();
        const storageRef = ref(storage, `facturas/${uniqueId}_${factura.name}`);
        const snapshot = await uploadBytes(storageRef, factura);
        urlPdf = await getDownloadURL(snapshot.ref);
      }
  
      const donacionId = uuidv4(); 
  
      const nuevaDonacion = {
        cantidad: cantidad.toString(),  // Guardar como cadena
        fecha: new Date().toISOString().split('T')[0],  // Formato YYYY-MM-DD
        id: donacionId,  
        nombre: nombre.trim(),  
        urlArchivo: urlPdf || '',  // URL del archivo o cadena vacía
      };
  
      // Guardar la donación en Firestore a través de la mutación
      await addDonacion({ donacion: nuevaDonacion, archivo: factura }).unwrap();
  
      // Resetear el formulario
      setCantidad('');
      setFactura(null);
      setNombre('');
      onClose();
    } catch (err) {
      console.error('Error al subir la donación:', err);
      setError('Error al enviar la donación. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFactura(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¿Cuánto deseas donar?</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Cantidad:</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              min="1"
              step="0.01"
            />
          </div>
          <div>
            <label>Subir factura:</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {isLoading && <p className="loading-message">Procesando donación...</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
          <button type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalDonar;