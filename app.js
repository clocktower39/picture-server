const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const userRoutes = require('./routes/userRoutes');

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/', userRoutes);

const mongoURI = process.env.ATLAS_URI;
const mongoConnection = mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
