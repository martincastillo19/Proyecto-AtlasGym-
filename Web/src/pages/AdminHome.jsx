import React, { useState } from "react";
import NuevoClienteForm from "../admin/NuevoClienteForm";
import ListaMembresia from "../admin/ListaMembresias";
import Ejercicios from "../admin/Ejercicios";
import Inventario from "../admin/Inventario";
import { useNavigate } from "react-router-dom";

function AdminHome({ setTipoUsuario }) {
  const [vista, setVista] = useState("membresias");
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("tipoUsuario");
    localStorage.removeItem("usuario");
    setTipoUsuario(null);
    navigate("/");
  };

  const renderContenido = () => {
    switch (vista) {
      case "membresias":
        return <ListaMembresia />;
      case "registrar":
        return <NuevoClienteForm />;
      case "ejercicios":
        return <Ejercicios />;
      case "inventario":
        return <Inventario />;
      default:
        return <NuevoClienteForm />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#121212",
      }}
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
        <div>
          <img
            src="/assets/atlaslogo_blanco.png"
            alt="Logo"
            style={{
              width: "100px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
        <button style={botonEstilo} onClick={() => setVista("membresias")}>
          Lista de
          <br /> membresías
        </button>
        <button style={botonEstilo} onClick={() => setVista("registrar")}>
          Registrar
          <br /> Usuario
        </button>
        <button style={botonEstilo} onClick={() => setVista("ejercicios")}>
          Administrar
          <br /> Ejercicios
        </button>
        <button style={botonEstilo} onClick={() => setVista("inventario")}>
          Inventario
        </button>
        <button onClick={cerrarSesion} style={botonCerrarSesion}>
          Cerrar sesión
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

const botonCerrarSesion = {
  marginTop: "auto",
  backgroundColor: "#ff4d4d",
  color: "white",
  border: "none",
  padding: "0.8rem",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
};

export default AdminHome;
