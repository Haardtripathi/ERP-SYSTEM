require('dotenv').config();
const express = require('express');
// const sequelize = require('./config/database');
const cors = require('cors');
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const multer = require("multer");
const fs = require("fs");

const authRoutes = require('./routes/authRoutes');
const incomingRoutes = require('./routes/incomingRoutes')
const leadRoutes = require('./routes/leadRoutes')

const MONGODB_URI = process.env.MONGODB_URI;


const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"]
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incoming', incomingRoutes)
app.use('/api/lead', leadRoutes)


// Sync Database and Start Server
mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        console.log("Connection established");
        app.listen(5001, () => console.log("Server running on port"));
    })
    .catch((err) => {
        console.log(err);
    });