import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/authRoutes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server run on port ${process.env.PORT}`);
});
