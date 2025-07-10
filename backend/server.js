const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const CLIENTES_PATH = "./Clientes.txt";

// Obtener clientes
app.get("/clientes", (req, res) => {
  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer:", err);
      return res.status(500).send("Error al leer");
    }
    res.send(data);
  });
});

// Agregar nuevo cliente
app.post("/clientes", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).send("Sin datos");

  fs.appendFile(CLIENTES_PATH, data + "\n", (err) => {
    if (err) {
      console.error("Error al guardar:", err);
      return res.status(500).send("Error al guardar");
    }
    res.send("Guardado correctamente");
  });
});

// Eliminar cliente por RUT
app.post("/eliminar", (req, res) => {
  const { rut } = req.body;
  if (!rut) return res.status(400).send("Falta RUT");

  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer");

    const lineas = data
      .split("\n")
      .filter((linea) => linea.trim() !== "" && !linea.includes(rut))
      .join("\n");

    fs.writeFile(CLIENTES_PATH, lineas, (err) => {
      if (err) return res.status(500).send("Error al escribir");
      res.send("Cliente eliminado");
    });
  });
});

// Actualizar cliente por RUT
app.put("/clientes/actualizar", (req, res) => {
  const clienteActualizado = req.body;

  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo archivo.");

    const lineas = data.split("\n").filter((line) => line.trim() !== "");
    let encontrado = false;

    const nuevasLineas = lineas.map((linea) => {
      const [nombre, apellido, rut, correo, ultimoPago] = linea.split("|");
      if (rut === clienteActualizado.rut) {
        encontrado = true;
        return `${clienteActualizado.nombre}|${clienteActualizado.apellido}|${clienteActualizado.rut}|${clienteActualizado.correo}|${clienteActualizado.ultimoPago}`;
      }
      return linea;
    });

    if (!encontrado) return res.status(404).send("Cliente no encontrado.");

    fs.writeFile(CLIENTES_PATH, nuevasLineas.join("\n"), (err) => {
      if (err) return res.status(500).send("Error escribiendo archivo.");
      res.json({ ok: true, mensaje: "Cliente actualizado correctamente." });
    });
  });
});

app.listen(3000, () =>
  console.log("✅ Servidor corriendo en http://localhost:3000")
);
