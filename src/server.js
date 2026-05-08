import app from "./index.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://expenza-ai.online",
      "https://www.expenza-ai.online",
    ],
    credentials: true,
  }),
);

app.listen(PORT, () => {
  console.log(`Server runing on port ${PORT}`);
});
