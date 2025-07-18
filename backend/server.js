const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENTES_PATH = "./Clientes.txt";
const EJERCICIOS_PATH = "./Ejercicios.txt";
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

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

// Agregar ejercicio (con archivo)
app.post("/ejercicios/subir", upload.single("archivo"), (req, res) => {
  const { nombre, zona } = req.body;

  if (!nombre || !zona || !req.file) {
    return res.status(400).send("Faltan campos.");
  }

  const archivoRuta = "uploads/" + req.file.filename;
  const nuevaLinea = `${nombre}|${zona}|${archivoRuta}\n`;

  fs.appendFile("Ejercicios.txt", nuevaLinea, (err) => {
    if (err) return res.status(500).send("Error al guardar ejercicio.");
    res.send("Ejercicio guardado correctamente.");
  });
});
// Eliminar ejercicio
app.post("/ejercicios/eliminar", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send("Falta nombre");

  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");

    const lineas = data.split("\n").filter((linea) => {
      if (linea.trim() === "") return false;
      const [n, _, ruta] = linea.split("|");
      if (n === nombre) {
        if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
        return false;
      }
      return true;
    });

    fs.writeFile(EJERCICIOS_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir ejercicios.");
      res.send("Ejercicio eliminado.");
    });
  });
});

// Actualizar ejercicio (puede tener nuevo archivo)
app.put("/ejercicios/actualizar", upload.single("archivo"), (req, res) => {
  const { nombre, zona, nombreOriginal } = req.body;

  if (!nombre || !zona || !nombreOriginal) {
    return res.status(400).send("Faltan campos.");
  }

  fs.readFile("Ejercicios.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al actualizar.");

    const lineas = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => linea.split("|"));

    let seActualizo = false;
    let archivoAnterior = "";

    const nuevasLineas = lineas.map(([n, z, archivo]) => {
      if (n === nombreOriginal) {
        seActualizo = true;
        archivoAnterior = archivo;
        const nuevoArchivo = req.file
          ? "uploads/" + req.file.filename
          : archivo;
        return `${nombre}|${zona}|${nuevoArchivo}`;
      }
      return `${n}|${z}|${archivo}`;
    });

    if (!seActualizo) return res.status(404).send("Ejercicio no encontrado.");

    fs.writeFile("Ejercicios.txt", nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al guardar cambios.");

      // Borrar archivo anterior si se subió uno nuevo
      if (req.file && archivoAnterior && fs.existsSync(archivoAnterior)) {
        fs.unlink(archivoAnterior, (err) => {
          if (err) console.warn("No se pudo borrar archivo anterior:", err);
        });
      }

      res.send("Ejercicio actualizado correctamente.");
    });
  });
});

// Servir archivos estáticos (para poder acceder a los videos desde frontend)
app.use("/uploads", express.static(UPLOADS_DIR));

app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);
