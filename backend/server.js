// const dotenv = require("dotenv")
// dotenv.config();
// const express = require("express");
// const connectDB = require("./config/db");

// // const {chats}= require("./data/data");

// const usesrRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");

// // const colors=require("colors");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// // const { Socket } = require("socket.io");


// console.log(process.env.MONGO_URI);
// connectDB();

// const app = express();
// app.use(express.json());

// app.use("/api/user", usesrRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);


// //////////////////////////////////////////////////////

// const path = require("path");

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// //////////////////////////////////////////////////////

// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, console.log(`server started on PORT ${PORT}`));

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000"
//     // credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");

//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     // console.log("User Joined Room: " + room);
//   });

//   socket.on("new message", (newMessageRecieved) => {
//     var chat = newMessageRecieved.chat;

//     if (!chat.users) return console.log("chat.users not defined");

//     chat.users.forEach((user) => {
//       if (user._id == newMessageRecieved.sender._id) return;

//       socket.in(user._id).emit("message recieved", newMessageRecieved);
//     });
//   });

//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.off("setup", () => {
//     console.log("USER DISCONNECTED");
//     socket.leave(userData._id);
//   });
// });


//call................
// Backend code

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");

const usersInCall = {};

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Error handling middleware
 const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// // const { Socket } = require("socket.io");

app.use(notFound);
app.use(errorHandler);

// Server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your frontend URL
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User setup
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  // Handle new message
  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  // Typing indicator
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // Voice call initiation
  socket.on("voice call", (roomId) => {
    socket.join(roomId);
    usersInCall[roomId] = usersInCall[roomId] || [];
    usersInCall[roomId].push(socket.id);

    if (usersInCall[roomId].length === 2) {
      io.to(roomId).emit("voice call initiated");
    }
  });

  // Video call initiation
  socket.on("video call", (roomId) => {
    socket.join(roomId);
    usersInCall[roomId] = usersInCall[roomId] || [];
    usersInCall[roomId].push(socket.id);

    if (usersInCall[roomId].length === 2) {
      io.to(roomId).emit("video call initiated");
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // Clean up users from call rooms
    Object.keys(usersInCall).forEach((roomId) => {
      const index = usersInCall[roomId].indexOf(socket.id);
      if (index !== -1) {
        usersInCall[roomId].splice(index, 1);
        if (usersInCall[roomId].length === 0) delete usersInCall[roomId];
      }
    });
  });

  // WebRTC signaling handlers
  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("candidate", (data) => {
    socket.to(data.roomId).emit("candidate", data);
  });
});

// Server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
