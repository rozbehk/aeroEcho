require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const cors = require("cors");
const flightStore = require("./src/stores/flightStore");
const flighData = require("./src/modules/data.js");
const app = express();
const { init } = require("./src/modules/socket.js");
const { initFlightSockets } = require("./src/controllers/flights");

const RELEASE = require("./package.json").version;
const NODE_ENV = process.env.NODE_ENV || "production";
const NODE_PORT = process.env.NODE_PORT || 3001;

app.set("port", NODE_PORT);
app.set("env", NODE_ENV);
app.set("ver", RELEASE);

function logRequests(req, res, next) {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log(`Origin: ${req.headers.origin}`);
  next();
}
app.use(logRequests);

const allowedOrigins = ["https://aeroecho.onrender.com"];

if (NODE_ENV === "development" || NODE_ENV === "staging") {
  allowedOrigins.push("http://localhost:3000");
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: [
    "Accept-Version",
    "Authorization",
    "Credentials",
    "Content-Type",
    "baggage",
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  optionsSuccessStatus: 204,
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'", "ws:", "wss:", ...allowedOrigins],
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.disable("x-powered-by");

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "200mb" }));

app.use(
  fileUpload({
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  })
);

app.use(cookieParser());

//Socket io
const server = http.createServer(app);
const io = init(server, {
  cors: { origin: allowedOrigins },
});
initFlightSockets(io);

app.options(/.*/, cors(corsOptions));
app.set("trust proxy", true);

app.use(
  morgan(
    ":remote-addr - :remote-user - [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] ':referrer' ':user-agent'",
    {
      stream: {
        write: (message, encoding) => {
          console.log(message.substring(0, message.lastIndexOf("\n")));
        },
      },
    }
  )
);

setInterval(flighData.getAllFlights, 2000);

const routesBasePath = require("./src/routes");
app.use("/api/v1", routesBasePath);

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  res.status(statusCode).json({
    status: "error",
    message: message,
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Error Details:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || err.status || 500;

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      details: err,
    }),
  });
});

// Set listening port
server.listen(NODE_PORT, "localhost", async () => {
  console.log(
    `Express Server with Socket.io started on Port: ${app.get(
      "port"
    )} | Environment: ${app.get("env")} | Release: ${app.get("ver")}`
  );
});
