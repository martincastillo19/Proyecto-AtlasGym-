import React, { useState } from "react";

import ListaClientes from "./components/ListaClientes";

function App() {
  const [vista, setVista] = useState("membresias");

  const renderContenido = () => {
    switch (vista) {
      case "membresias":
        return <ListaClientes />;
      case "":
        return <NuevoClienteForm />;
      
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#121212" }}
    >
      <div
        style={{
          width: "220px",
          backgroundColor: "#1e1e1e",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <button style={botonEstilo} onClick={() => setVista("membresias")}>
          Lista de
          <br />
          membresías
        </button>
        <button style={botonEstilo} onClick={() => setVista("registrar")}>
          Registrar
          <br />
          Usuario
        </button>
        <button style={botonEstilo} onClick={() => setVista("ejercicios")}>
          Administrar
          <br />
          Ejercicios
        </button>
        <button style={botonEstilo} onClick={() => setVista("inventario")}>
          Inventario
        </button>
      </div>

      <div style={{ flex: 1, padding: "2rem" }}>{renderContenido()}</div>
    </div>
  );
}

const botonEstilo = {
  backgroundColor: "#444",
  color: "white",
  border: "none",
  padding: "1rem",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background-color 0.3s",
  textAlign: "left",
};

export default App;
