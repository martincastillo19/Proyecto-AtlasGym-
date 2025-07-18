const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENTES_PATH = "./Clientes.txt";
const EJERCICIOS_PATH = "./Ejercicios.txt";

// --- RUTAS CLIENTES ---

// Obtener clientes
app.get("/clientes", (req, res) => {
  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer clientes.");
    res.send(data);
  });
});

// Agregar cliente
app.post("/clientes", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).send("Sin datos");

  fs.appendFile(CLIENTES_PATH, data + "\n", (err) => {
    if (err) return res.status(500).send("Error al guardar cliente.");
    res.send("Cliente guardado correctamente.");
  });
});

// Eliminar cliente por RUT y correo (buscar línea exacta)
app.post("/clientes/eliminar", (req, res) => {
  const { rut, correo } = req.body;
  if (!rut || !correo) return res.status(400).send("Falta rut o correo");

  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer clientes.");

    const lineas = data.split("\n").filter((linea) => {
      if (linea.trim() === "") return false;
      const [_, __, r, c] = linea.split("|");
      return !(r === rut && c === correo);
    });

    fs.writeFile(CLIENTES_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir clientes.");
      res.send("Cliente eliminado.");
    });
  });
});

// Actualizar cliente por correo original, validando RUT y correo duplicado
app.put("/clientes/actualizar", (req, res) => {
  const clienteActualizado = req.body;

  if (!clienteActualizado.correoOriginal) {
    return res
      .status(400)
      .send("Falta correoOriginal para identificar cliente.");
  }

  fs.readFile(CLIENTES_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo clientes.");

    const lineas = data.split("\n").filter((line) => line.trim() !== "");

    let encontrado = false;

    // Validar RUT duplicado (excepto "sin rut")
    const rutDuplicado = lineas.some((linea) => {
      const [_, __, rut, correo] = linea.split("|");
      return (
        rut === clienteActualizado.rut &&
        rut !== "sin rut" &&
        correo !== clienteActualizado.correoOriginal
      );
    });

    if (rutDuplicado) {
      return res.status(409).send("Ya existe un cliente con ese RUT.");
    }

    // Validar correo duplicado
    const correoDuplicado = lineas.some((linea) => {
      const [_, __, ___, correo] = linea.split("|");
      return (
        correo === clienteActualizado.correo &&
        correo !== clienteActualizado.correoOriginal
      );
    });

    if (correoDuplicado) {
      return res.status(409).send("Ya existe un cliente con ese correo.");
    }

    // Actualizar la línea correspondiente
    const nuevasLineas = lineas.map((linea) => {
      const [nombre, apellido, rut, correo, ultimoPago] = linea.split("|");
      if (correo === clienteActualizado.correoOriginal) {
        encontrado = true;
        return `${clienteActualizado.nombre}|${clienteActualizado.apellido}|${clienteActualizado.rut}|${clienteActualizado.correo}|${clienteActualizado.ultimoPago}`;
      }
      return linea;
    });

    if (!encontrado) {
      return res.status(404).send("Cliente original no encontrado.");
    }

    fs.writeFile(CLIENTES_PATH, nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error escribiendo clientes.");
      res.json({ ok: true, mensaje: "Cliente actualizado correctamente." });
    });
  });
});

// --- RUTAS EJERCICIOS ---

// Obtener ejercicios
app.get("/ejercicios", (req, res) => {
  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");
    res.send(data);
  });
});

// Agregar ejercicio
app.post("/ejercicios", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).send("Sin datos");

  fs.appendFile(EJERCICIOS_PATH, data + "\n", (err) => {
    if (err) return res.status(500).send("Error al guardar ejercicio.");
    res.send("Ejercicio guardado correctamente.");
  });
});

// Eliminar ejercicio por nombre
app.post("/ejercicios/eliminar", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send("Falta nombre");

  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");

    const lineas = data
      .split("\n")
      .filter(
        (linea) => linea.trim() !== "" && !linea.startsWith(nombre + "|")
      );

    fs.writeFile(EJERCICIOS_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir ejercicios.");
      res.send("Ejercicio eliminado.");
    });
  });
});

// Actualizar ejercicio
app.put("/ejercicios/actualizar", (req, res) => {
  const ejercicioActualizado = req.body;

  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo ejercicios.");

    const lineas = data.split("\n").filter((line) => line.trim() !== "");
    let encontrado = false;

    const nuevasLineas = lineas.map((linea) => {
      const [nombre] = linea.split("|");
      if (nombre === ejercicioActualizado.nombre) {
        encontrado = true;
        return `${ejercicioActualizado.nombre}|${ejercicioActualizado.zona}|${ejercicioActualizado.link}`;
      }
      return linea;
    });

    if (!encontrado) return res.status(404).send("Ejercicio no encontrado.");

    fs.writeFile(EJERCICIOS_PATH, nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error escribiendo ejercicios.");
      res.json({ ok: true, mensaje: "Ejercicio actualizado correctamente." });
    });
  });
});

// Iniciar servidor
app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);
