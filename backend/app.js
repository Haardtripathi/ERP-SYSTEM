require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const http = require("http");

// Route Imports
const authRoutes = require('./routes/authRoutes');
const incomingRoutes = require('./routes/incomingRoutes')
const leadRoutes = require('./routes/leadRoutes')
const workbookRoutes = require('./routes/workbookRoutes')
const pendingRoutes = require('./routes/pendingRoutes')
const confirmedRoutes = require('./routes/confirmedRoutes')
const sheetRoutes = require("./routes/sheetRoutes")
const labelRoutes = require("./routes/labelRoutes")
const dispatchedRoutes = require("./routes/dispatchedRoutes")
const returnRoutes = require("./routes/returnRoutes")
const complainRoutes = require("./routes/complainRoutes")
const profileRoutes = require("./routes/profileRoutes")
const deliveredRoutes = require("./routes/deliveredRoutes")

const paymentRoutes = require("./routes/paymentRoutes")
const adminRoutes = require("./routes/adminRoutes")
const roleRoutes = require('./routes/roleRoutes')


const chatRoutes = require("./routes/chatRoutes"); // ✅ NEW

// Socket.IO Setup
const { setupSocket } = require("./socket/chatSocket");

// DB URI
const MONGODB_URI = process.env.MONGODB_URI;

// App Setup
const app = express();
const server = http.createServer(app); // Use HTTP server for socket.io
setupSocket(server); // Initialize socket

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incoming', incomingRoutes)
app.use('/api/lead', leadRoutes)
app.use('/api/workbook', workbookRoutes)
app.use('/api/pending', pendingRoutes)
app.use('/api/confirmed', confirmedRoutes)
app.use('/api/sheets', sheetRoutes)
app.use('/api/label', labelRoutes)
app.use('/api/label', labelRoutes)
app.use('/api/dispatched', dispatchedRoutes)
app.use('/api/return', returnRoutes)
app.use('/api/complain', complainRoutes)
app.use('/api', profileRoutes)
app.use('/api/delivered', deliveredRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', roleRoutes)
app.use('/api/chat', chatRoutes);

// Connect to DB and Start Server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connection established");
        server.listen(5001, () => console.log("Server running on port 5001"));
    })
    .catch((err) => {
        console.error(err);
        console.error("MongoDB connection error:", err);
    });
