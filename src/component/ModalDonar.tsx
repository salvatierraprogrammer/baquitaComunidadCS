import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAddDonacionMutation, useGetDonacionesQuery } from '../service/ecApi';
import { storage } from '../Confg/firebase';
import '../assets/css/ModalDonar.css';
import { v4 as uuidv4 } from 'uuid';

interface ModalDonarProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any; // Ajustar al tipo correcto para usuario
    totalRecaudado: number; // Pasar el total recaudado actual
    LIMITE_RECAUDADO: number; // Limite máximo de donaciones
}

function ModalDonar({ isOpen, onClose, usuario, totalRecaudado, LIMITE_RECAUDADO }: ModalDonarProps) {
    const [cantidad, setCantidad] = useState('');
    const [factura, setFactura] = useState<File | null>(null);
    const [nombre, setNombre] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [addDonacion] = useAddDonacionMutation();
    const { data: donaciones = [] } = useGetDonacionesQuery();
    
    // Estado para la cantidad total recaudada
    const [totalRecaudadoCalculado, setTotalRecaudadoCalculado] = useState(totalRecaudado);

    useEffect(() => {
        // Calcular el total recaudado desde las donaciones
        const total = donaciones.reduce((acc: number, donacion: any) => acc + parseFloat(donacion.cantidad), 0);
        setTotalRecaudadoCalculado(total);
    }, [donaciones]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg('');
    
        // Limitar el nombre a 13 caracteres
        if (nombre.length > 13) {
            setErrorMsg('El nombre no puede tener más de 13 caracteres.');
            return;
        }
    
        // Verificar que la cantidad no exceda el límite restante y el máximo
        const cantidadNum = parseFloat(cantidad);
        if (cantidadNum <= 0 || cantidadNum > 50000) {
            setErrorMsg('La cantidad debe ser mayor a 0 y no puede exceder $50,000 ARS.');
            return;
        }
    
        if (totalRecaudadoCalculado + cantidadNum > LIMITE_RECAUDADO) {
            setErrorMsg(`La cantidad excede el límite de donación disponible. Solo puedes donar hasta $${(LIMITE_RECAUDADO - totalRecaudadoCalculado).toFixed(2)} ARS.`);
            return;
        }
    
        // Verificar que se haya subido una factura
        if (!factura) {
            setErrorMsg('Es obligatorio subir una factura.');
            return;
        }
    
      

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
                cantidad: cantidadNum.toFixed(2),
                fecha: new Date().toISOString().split('T')[0],
                id: donacionId,
                nombre: nombre.trim(),
                urlArchivo: urlPdf || '',
            };

            await addDonacion({ donacion: nuevaDonacion }).unwrap();

            // Resetear el formulario
            setCantidad('');
            setFactura(null);
            setNombre('');
            onClose();

            // Mostrar agradecimiento si llegamos al límite
            if (totalRecaudadoCalculado + cantidadNum >= LIMITE_RECAUDADO) {
                alert('¡Muchas gracias por tu colaboración! Hemos alcanzado el objetivo.');
            }
        } catch (err) {
            console.error('Error al subir la donación:', err);
            setErrorMsg('Error al enviar la donación. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFactura(e.target.files[0]);
        }
    };
    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cantidadNum = parseFloat(value);

    // Validar el valor ingresado
    if (value === '' || (cantidadNum <= 50000 && cantidadNum > 0)) {
        setCantidad(value);
        setErrorMsg(''); // Limpiar mensaje de error si el valor es válido
    } else {
        setErrorMsg('La cantidad no puede exceder $50,000 ARS.');
    }
};

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>¿Cuánto deseas donar?</h2>
                <p>Total recaudado: ${totalRecaudadoCalculado.toFixed(2)} ARS</p>
                <h2>Transferir Mercado pago alias: </h2><p> aqui.mi.alias</p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value.slice(0, 13))} // Limitar a 13 caracteres
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="cantidad">Cantidad:</label>
                        <input
    type="number"
    id="cantidad"
    value={cantidad}
    onChange={handleCantidadChange} // Cambiado para usar la nueva función
    required
    min="0.01" // Cambiado para permitir cantidades mayores a 0
    step="0.01"
    max="50000" // Limitar la cantidad máxima a 50.000
/>
                    </div>
                    <div>
                        <label htmlFor="factura">Subir factura (obligatorio):</label>
                        <input
                            type="file"
                            id="factura"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    {errorMsg && <p className="error-message">{errorMsg}</p>}
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