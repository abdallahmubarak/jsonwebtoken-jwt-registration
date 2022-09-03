require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path =require("path")
const bodyParser =require("body-parser")
const User = require("./model/user");

const app = express();

app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())
app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email, 
      password: encryptedPassword,
    });
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_KEY,
      {
        expiresIn: "2h",
      }
    );
  
    user.token = token;

  
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  
});
app.post("/login", async (req, res,next) => {
  try {
  
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
    
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_KEY,
        {
          expiresIn: "2d",
        }     );
        user.token =token;
      res.status(200).json(user);
    }
  
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid user");
  }
});
module.exports = app;