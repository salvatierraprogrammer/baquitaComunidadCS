import { createApi } from '@reduxjs/toolkit/query/react';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore'; // Importar getDocs
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { db, storage } from '../Confg/firebase';

export const ecApi = createApi({
  reducerPath: "ecApi",
  baseQuery: async (args) => {
    return { data: args }; 
  },
  endpoints: (builder) => ({
    getDonaciones: builder.query({
      async queryFn() {
        try {
          const querySnapshot = await getDocs(collection(db, "donaciones"));
          const donaciones = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          return { data: donaciones };
        } catch (error) {
          console.error("Error fetching donations: ", error);
          return { error: { message: error.message } };
        }
      },
    }),
    
    addDonacion: builder.mutation({
      async queryFn({ donacion, archivo }) {
        try {
          let archivoUrl = '';
    
          if (archivo) {
            const storageRef = ref(storage, `facturas/${archivo.name}`);
            const snapshot = await uploadBytes(storageRef, archivo);
            archivoUrl = await getDownloadURL(snapshot.ref);
          }
    
          const nuevaDonacion = { ...donacion, urlArchivo: archivoUrl };
          const docRef = await addDoc(collection(db, "donaciones"), nuevaDonacion);
          return { data: { id: docRef.id, ...nuevaDonacion } };
        } catch (error) {
          console.error("Error adding donation: ", error);
          return { error: { message: error.message } };
        }
      },
    }),

    deleteDonacion: builder.mutation({
      async queryFn(id) {
        try {
          await deleteDoc(doc(db, "donaciones", id));
          return { data: id }; 
        } catch (error) {
          console.error("Error deleting donation: ", error);
          return { error: { message: error.message } };
        }
      },
    }),
  }),
});

export const {
  useGetDonacionesQuery,
  useAddDonacionMutation,
  useDeleteDonacionMutation,
} = ecApi;