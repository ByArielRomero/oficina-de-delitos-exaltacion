import express from 'express'
import cors from "cors";
import dotenv from "dotenv";
import { env } from 'process';

dotenv.config()
const app = express()

const PORT = env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})