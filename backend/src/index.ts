import 'dotenv/config'; // Must be the FIRST line
import express from "express";
import cors from "cors";
import normasRoutes from "./routes/normas.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // importante pro base64

app.use("/normas", normasRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});