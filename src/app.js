const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mysql = require("mysql2");
const myconn = require("express-myconnection");
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

require("dotenv").config();
/*const dbOptions = {
  host: process.env.HOST,
  port: process.env.DB_PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
};*/

const dbOptions = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'root',
  database: 'DbContabilly',
};

const middlewares = require("./middlewares");
const api = require("./api");
const mailer = require("./mailer");
const firebaseMessagging = require("./firebaseMesagging");
const app = express();

app.use(bodyParser.json({ limit: '25mb' }));
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(myconn(mysql, dbOptions, "single"));

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SUPLAIER API',
      description: 'Documentación de la API para el proyecto Suplaier.',
      version: '1.0.0',
    },
  },
  apis: ['./src/api/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
app.use(mailer.enviarCorreo);
app.use(firebaseMessagging.enviarNotificacionTopic);
module.exports = app;
