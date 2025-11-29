require("dotenv").config();

const express = require("express");
const productCategories = require("./routes/productCategories");
const products = require("./routes/product"); // Import the products route
const users = require("./routes/users"); // Import the users route
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const orders = require("./routes/orders"); // Import the orders route

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request body
app.use("/productCategories", productCategories);
app.use("/products", products); // Use the products route
app.use("/users", users); // Use the users route
app.use("/orders", orders); // Use the orders route

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
