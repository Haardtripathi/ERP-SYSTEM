require('dotenv').config();
const express = require('express');
// const sequelize = require('./config/database');
const cors = require('cors');
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const http = require("http");
const { Server } = require("socket.io");


const fs = require("fs");

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
const chatRoutes = require('./routes/chatRoutes');




const MONGODB_URI = process.env.MONGODB_URI;


const app = express();
const server = http.createServer(app); // ⬅️ Required for Socket.IO
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(bodyParser.json({ limit: "10mb" })); // Increase JSON payload limit
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

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

app.use('/api/chat', chatRoutes); // ⬅️ Add this too

// Socket.io logic
const registerSocketHandlers = require('./services/socketService');
registerSocketHandlers(io); // ⬅️ Init socket logic











// Sync Database and Start Server
mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        console.log("Connection established");
        server.listen(5001, () => console.log("Server running on port 5001"));
    })
    .catch((err) => {
        console.error(err);
    });