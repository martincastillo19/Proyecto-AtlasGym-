import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import ClientHome from "./pages/ClientHome";
import { useState, useEffect } from "react";

function App() {
  const [tipoUsuario, setTipoUsuario] = useState(
    localStorage.getItem("tipoUsuario")
  );
  const [usuario, setUsuario] = useState(() => {
    const storedUser = localStorage.getItem("usuario");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setTipoUsuario(localStorage.getItem("tipoUsuario"));
      const storedUser = localStorage.getItem("usuario");
      setUsuario(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login setTipoUsuario={setTipoUsuario} setUsuario={setUsuario} />
        }
      />
      {tipoUsuario === "admin" && (
        <Route
          path="/admin/*"
          element={<AdminHome setTipoUsuario={setTipoUsuario} />}
        />
      )}
      {tipoUsuario === "cliente" && (
        <Route
          path="/cliente/*"
          element={
            <ClientHome setTipoUsuario={setTipoUsuario} usuario={usuario} />
          }
        />
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
