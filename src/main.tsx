import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // Asegúrate de importar esto
import { store } from "./redux/store"; // Asegúrate de tener tu store bien configurado
import App from "./App";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <Provider store={store}> {/* El Provider debe envolver toda tu app */}
      <App />
    </Provider>
  </React.StrictMode>
);