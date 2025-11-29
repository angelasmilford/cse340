const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

/* ******************************
 * Registration Validation Rules
 *********************************/
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check Registration Data
 *********************************/
validate.checkRegData = async (req, res, next) => {
  if (!req.body) {
    console.error("❌ req.body is undefined. Check form or middleware.");
    return res.status(400).send("No data received.");
  }

  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  next();
};

/* ******************************
 * Login Validation Rules
 *********************************/
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ];
};

/* ******************************
 * Check Login Data
 *********************************/
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email,
    });
  }

  next();
};

// Server-side validation for account update
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isAlpha()
      .withMessage("First name must contain only letters.")
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .isAlpha()
      .withMessage("Last name must contain only letters.")
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (email, { req }) => {
        const existingEmail = await accountModel.getAccountByEmail(email);
        if (existingEmail && existingEmail.account_id != req.body.account_id) {
          throw new Error("Email already exists. Choose another.");
        }
      }),
  ];
};

validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter.")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter.")
      .matches(/\d/)
      .withMessage("Password must include a number.")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must include a symbol."),
  ];
};

validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      accountData: {
        account_id: req.body.account_id,
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email,
      },
    });
  }
  next();
};

validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash("notice", "Password update failed. Please fix errors.");

    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      accountData: await accountModel.getAccountById(req.body.account_id),
    });
  }
  next();
};

module.exports = validate;
