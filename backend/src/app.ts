import express from "express";
import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
import activateWebRoutes from "./routes/web.js";
import initDatabase from "./config/seed.js";

const app = express();
const PORT = process.env.PORT || 8080;

// config CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// config view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');

// config body parser and cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// init database
initDatabase();

activateWebRoutes(app);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

