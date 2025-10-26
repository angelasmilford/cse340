// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation');

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration form
router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),  // 1️⃣ Run the validation rules
  regValidate.checkRegData,        // 2️⃣ Check for errors & handle them
  utilities.handleErrors(accountController.registerAccount) // 3️⃣ Controller handles registration if valid
);

module.exports = router
