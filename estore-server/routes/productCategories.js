const express = require("express");
const router = express.Router(); // Use Router() instead of express()
const pool = require("../shared/pool"); // Import the MySQL connection pool



// Convert pool to use promises
const promisePool = pool.promise();

router.get("/", async (req, res) => {
  try {
    // Directly use pool.query() instead of getting a connection first
    const [categories] = await promisePool.query("SELECT * FROM categories");
    res.status(200).send(categories);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Error accessing the database");
  }
});

module.exports = router; // Export the router, not productCategories
