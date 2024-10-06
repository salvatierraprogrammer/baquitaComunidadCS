import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAddDonacionMutation } from '../service/ecApi';
import { storage } from '../Confg/firebase';
import '../assets/css/ModalDonar.css';
import { v4 as uuidv4 } from 'uuid';

interface ModalDonarProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any; // Adjust to the correct type for usuario
}

function ModalDonar({ isOpen, onClose, usuario }: ModalDonarProps) {
    const [cantidad, setCantidad] = useState('');
    const [factura, setFactura] = useState<File | null>(null);
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [addDonacion] = useAddDonacionMutation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                cantidad: cantidad.toString(),
                fecha: new Date().toISOString().split('T')[0],
                id: donacionId,
                nombre: nombre.trim(),
                urlArchivo: urlPdf || '',
            };

            await addDonacion({ donacion: nuevaDonacion, archivo: factura }).unwrap();

            // Reset the form
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
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