const express = require("express");
const pool = require("../shared/pool");
const orders = express.Router();
const checkToken = require("../shared/checkToken");

orders.post("/add", checkToken, (req, res) => {
  try {
    let userName = req.body.userName;
    let userEmail = req.body.userEmail;
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let pin = req.body.pin;
    let total = req.body.total;
    let orderDetails = req.body.orderDetails;

    // Validación básica de entrada
    if (!userName || !userEmail || !address || !city || !state || !pin || !total || !orderDetails) {
      return res.status(400).send({
        message: "All fields are required.",
      });
    }

    if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
      return res.status(400).send({
        message: "Order must contain at least one item.",
      });
    }

    pool.query(
      "SELECT id FROM users WHERE email = ?",
      [userEmail],
      (error, user) => {
        if (error) {
          res.status(500).send({
            error: error.code,
            message: error.message,
          });
        } else {
          if (user.length > 0) {
            let userId = user[0].id;
            const query = `INSERT INTO orders (userId, userName, address, city, state, pin, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
            pool.query(query, [userId, userName, address, city, state, pin, total], (error, result) => {
              if (error) {
                res.status(401).send({
                  error: error.code,
                  message: error.message,
                });
              } else {
                let orderId = result.insertId;
                let detailsInserted = 0;
                let hasError = false;

                orderDetails.forEach((item, index) => {
                  const detailsQuery = `INSERT INTO orderdetails
                    (orderId, productId, qty, price, amount) VALUES (?, ?, ?, ?, ?)`;
                  pool.query(
                    detailsQuery,
                    [orderId, item.productId, item.qty, item.price, item.amount],
                    (detailsError, detailsResult) => {
                      if (detailsError && !hasError) {
                        hasError = true;
                        res.status(401).send({
                          error: detailsError.code,
                          message: detailsError.message,
                        });
                      } else {
                        detailsInserted++;
                        if (detailsInserted === orderDetails.length && !hasError) {
                          res.status(201).send({ message: "success" });
                        }
                      }
                    }
                  );
                });
              }
            });
          } else {
            res.status(401).send({ message: `User doesn't exist.` });
          }
        }
      }
    );
  } catch (error) {
    res.status(400).send({
      error: error.code,
      message: error.message,
    });
  }
});

orders.get("/allorders", checkToken, (req, res) => {
  try {
    let userEmail = req.query.userEmail;

    // Validación básica de entrada
    if (!userEmail) {
      return res.status(400).send({
        message: "User email is required.",
      });
    }

    pool.query(
      "SELECT id FROM users WHERE email = ?",
      [userEmail],
      (error, user) => {
        if (error) {
          res.status(500).send({
            error: error.code,
            message: error.message,
          });
        } else {
          if (user.length > 0) {
            let userId = user[0].id;
            pool.query(
              "SELECT orderId, DATE_FORMAT(orderDate,'%m/%d/%Y') as orderDate, userName, address, city, state, pin, total FROM orders WHERE userId = ?",
              [userId],
              (error, orders) => {
                if (error) {
                  res.status(500).send({
                    error: error.code,
                    message: error.message,
                  });
                } else {
                  const allOrders = [];
                  orders.forEach((order) => {
                    allOrders.push({
                      orderId: order.orderId,
                      userName: order.userName,
                      address: order.address,
                      city: order.city,
                      state: order.state,
                      pin: order.pin,
                      total: order.total,
                      orderDate: order.orderDate,
                    });
                  });
                  res.status(200).send(allOrders);
                }
              }
            );
          } else {
            res.status(404).send({ message: `User doesn't exist.` });
          }
        }
      }
    );
  } catch (error) {
    res.status(400).send({
      error: error.code,
      message: error.message,
    });
  }
});

orders.get("/orderproducts", checkToken, (req, res) => {
  try {
    let orderId = req.query.orderId;

    // Validación básica de entrada
    if (!orderId || isNaN(orderId)) {
      return res.status(400).send({
        message: "Valid order ID is required.",
      });
    }

    pool.query(
      `SELECT orderdetails.*, products.product_name, products.product_img
       FROM orderDetails
       INNER JOIN products ON orderDetails.productId = products.id
       WHERE orderId = ?`,
      [orderId],
      (error, orderProducts) => {
        if (error) {
          res.status(500).send({
            error: error.code,
            message: error.message,
          });
        } else {
          let orderDetails = [];
          orderProducts.forEach((orderProduct) => {
            orderDetails.push({
              productId: orderProduct.productId,
              productName: orderProduct.product_name,
              productImage: orderProduct.product_img,
              qty: orderProduct.qty,
              price: orderProduct.price,
              amount: orderProduct.amount,
            });
          });
          res.status(200).send(orderDetails);
        }
      }
    );
  } catch (error) {
    res.status(400).send({
      error: error.code,
      message: error.message,
    });
  }
});

module.exports = orders;
