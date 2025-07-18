const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Crear carpeta uploads si no existe
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const nombreFinal = `${timestamp}-${file.originalname}`;
    cb(null, nombreFinal);
  },
});
const upload = multer({ storage });

// =======================================
// GET /ejercicios
// =======================================
app.get("/ejercicios", (req, res) => {
  fs.readFile("Ejercicios.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");

    const ejercicios = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => {
        const [nombre, zona, archivo] = linea.split("|");
        return { nombre, zona, archivo };
      });

    res.json(ejercicios);
  });
});

// =======================================
// POST /ejercicios/subir
// =======================================
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

// =======================================
// PUT /ejercicios/actualizar
// =======================================
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

// =======================================
// DELETE /ejercicios/eliminar
// =======================================
app.delete("/ejercicios/eliminar", (req, res) => {
  const { nombre } = req.body;

  if (!nombre) return res.status(400).send("Falta el nombre del ejercicio.");

  fs.readFile("Ejercicios.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");

    const lineas = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => linea.split("|"));

    let archivoAEliminar = null;

    const nuevasLineas = lineas.filter(([n, zona, archivo]) => {
      if (n === nombre) {
        archivoAEliminar = archivo;
        return false;
      }
      return true;
    });

    if (!archivoAEliminar)
      return res.status(404).send("Ejercicio no encontrado.");

    fs.writeFile(
      "Ejercicios.txt",
      nuevasLineas.map((l) => l.join("|")).join("\n") + "\n",
      (err) => {
        if (err) return res.status(500).send("Error al guardar cambios.");

        if (fs.existsSync(archivoAEliminar)) {
          fs.unlink(archivoAEliminar, (err) => {
            if (err) console.warn("No se pudo borrar el archivo:", err);
          });
        }

        res.send("Ejercicio eliminado correctamente.");
      }
    );
  });
});

// =======================================
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
