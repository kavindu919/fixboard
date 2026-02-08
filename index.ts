import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/authRoutes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/issues", authRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server run on port ${process.env.PORT}`);
});
