import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import reportRoutes from "./routes/report.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import chartRoutes from "./routes/charts.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Route Connect
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("ApI is running...");
});

export default app;
