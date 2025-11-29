const express = require("express");
const products = express.Router();
const pool = require("../shared/pool");

const promisePool = pool.promise();

products.get("/", async (req, res) => {
  const mainCategoryId = req.query.maincategoryid;
  const subCategoryId = req.query.subcategory;
  const keyword = req.query.keyword;

  let query = "SELECT * FROM products";
  const params = [];

  try {
    if (subCategoryId) {
      // This means user wants products in a specific subcategory
      query = "SELECT * FROM products WHERE category_id = ?";
      params.push(subCategoryId);
    } else if (mainCategoryId) {
      // This means user wants products in any subcategory whose parent_category_id = mainCategoryId
      query = `
        SELECT p.*
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE c.parent_category_id = ?
      `;
      params.push(mainCategoryId);
    }

    if (keyword) {
      const hasWhereClause = query.includes("WHERE");
      query += hasWhereClause ? " AND keywords LIKE ?" : " WHERE keywords LIKE ?";
      params.push(`%${keyword}%`);
    }

    console.log("Executing query:", query);
    console.log("With parameters:", params);

    const [productsList] = await promisePool.query(query, params);
    res.status(200).json(productsList);
  } catch (err) {
    console.error("Database error details:", err.message);
    res.status(500).send(`Database error: ${err.message}`);
  }
});
products.get("/(:id)", (req, res) => {
  let id = req.params.id;

  // Validación básica de entrada
  if (!id || isNaN(id)) {
    return res.status(400).send({ message: "Invalid product ID" });
  }

  pool.query("SELECT * FROM products WHERE id = ?", [id], (error, products) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send(products);
    }
  });
});


 

module.exports = products;
