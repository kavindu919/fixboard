import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import issueRoute from "./routes/issueRoutes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server run on port ${process.env.PORT}`);
});
