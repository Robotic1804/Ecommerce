const express = require('express');
const pool = require('../shared/pool');
const bcryptjs = require('bcryptjs');
const users = express.Router();
const jwtoken = require('jsonwebtoken');

users.post('/signup', async (req, res) => {
    try {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let address = req.body.address;
        let city = req.body.city;
        let state = req.body.state;
        let pin = req.body.pin;
        let email = req.body.email;
        let password = req.body.password ;

        // Check if email exists
        pool.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email], (err, resultCount) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
    
            if (resultCount[0].count > 0) {
                return res.status(409).send({ error: 'Email already exists' });
            }
    
            // Hash password and insert user
            let hashedPassword = bcryptjs.hashSync(password, 8);
    
            const insertQuery = `
        INSERT INTO users (firstName, lastName, address, city, state, pin, email, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
            const values = [firstName, lastName, address, city, state, pin, email, hashedPassword];
    
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send({ error: 'Internal server error' });
                }
        
                res.status(201).send({ message: 'Success' });
            });
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
users.post("/login", (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    // Validación básica de entrada
    if (!email || !password) {
      return res.status(400).send({
        message: "Email and password are required.",
      });
    }

    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, result) => {
        if (error) {
          res.status(500).send({
            error: error.code,
            message: error.message,
          });
        } else {
          if (result.length > 0) {
            bcryptjs
              .compare(password, result[0].password)
              .then((compareResult) => {
                if (compareResult) {
                  const token = jwtoken.sign(
                    { id: result[0].id, email: result[0].email },
                    process.env.JWT_SECRET || "estore-secret-key",
                    { expiresIn: "1h" }
                  );
                  res.status(200).send({
                    token: token,
                    expiresInSeconds: 3600,
                    user: {
                      id: result[0].id,
                      firstName: result[0].firstName,
                      lastName: result[0].lastName,
                      address: result[0].address,
                      city: result[0].city,
                      state: result[0].state,
                      pin: result[0].pin,
                    },

                  });
                } else {
                  res.status(401).send({
                    message: `Invalid password.`,
                  });
                }
              });
          } else {
            res.status(401).send({
              message: `User doesn't exist.`,
            });
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
module.exports = users;