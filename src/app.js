import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { cookie } from 'express-validator';
import { env } from 'process';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import zonaRoutes from "./routes/zonaRoutes.js";
import casoRoutes from "./routes/casoRoutes.js";
import session from "express-session";
import usuarioRoutes from "./routes/usuarioRoutes.js";  // BIEN

dotenv.config()
const app = express()
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Para leer datos de formularios HTML
app.use(express.json()); // Para leer JSON (por ejemplo desde fetch o axios)


app.use(session({
  secret: "mi_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000  } // 10 min
}));



app.set("views", "src/views"); 
app.set("view engine", "ejs");
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos correctamente
app.use(express.static(path.join(__dirname, "./public")));



// Routers
app.get('/', (req, res) => {
  res.redirect('login');
});
app.use("/", authRoutes);
app.use("/", personaRoutes);
app.use("/", dashboardRoutes);
app.use("/zonas", zonaRoutes); 
app.use("/", casoRoutes);
app.use("/", usuarioRoutes);

const PORT = env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})