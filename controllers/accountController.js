// Needed Resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,           // no errors initially
    account_email: "",      // keeps email field sticky
    messages: req.flash("notice"), // flash messages
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,           // ensures view can safely check for errors
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash("notice"),
    })
  }

  try {
    const regResult = await accountModel.accountRegister(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: "",
        messages: req.flash("notice"),
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        messages: req.flash("notice"),
      })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "An unexpected error occurred. Please try again.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash("notice"),
    })
  }
}

/* ****************************************
 *  Process login request (JWT version)
 *  This function is used by your routes currently:
 *  router.post('/login', ..., accountController.accountLogin)
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("[CTRL] AccountLogin error:", error)
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process Login (validation-first, session version)
*  This is kept in case you want to use session-based login.
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email: req.body.account_email, // sticky
      messages: req.flash("notice"),
    })
  }

  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Email or password is incorrect.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash("notice"),
      })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Email or password is incorrect.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash("notice"),
      })
    }

    // Save user session
    req.session.account = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_email: accountData.account_email,
      account_type: accountData.account_type || "Client",
    }

    req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
    return res.redirect("/account")
  } catch (error) {
    console.error(error)
    req.flash("notice", "An unexpected error occurred. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: req.body.account_email,
      messages: req.flash("notice"),
    })
  }
}

/* ****************************************
*  Deliver Account Management View
* *************************************** */
/* ****************************************
 *  Account Management View
 *  GET /account/
 *  Shows the "You're logged in." page
 * **************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const accountData = res.locals.accountData
    // Render the management page view
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
    })
  } catch (error) {
    // Debugging
    console.error("[CTRL] Error building account management view", error)
    next(error)
  }
}

async function buildUpdateAccountView(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id } = req.params
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    messages: req.flash("notice"),
    accountData,
  })
}

async function buildUpdateAccount(req, res) {
  const account_id = req.params.account_id;
  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    messages: req.flash("notice"),
    accountData,
  });
}async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
  } else {
    req.flash("notice", "Account update failed.");
  }

  const refreshedData = await accountModel.getAccountById(account_id);

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash("notice"),
    accountData: refreshedData,
  });
}

async function updateAccountPassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  const hashedPw = await bcrypt.hash(account_password, 10);

  const result = await accountModel.updatePassword(account_id, hashedPw);

  if (result) {
    req.flash("notice", "Password updated successfully.");
  } else {
    req.flash("notice", "Password update failed.");
  }

  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash("notice"),
    accountData,
  });
}

async function logoutAccount(req, res) {
  // Clear the JWT token cookie
  res.clearCookie("jwt");

  // Redirect to home
  return res.redirect("/");
}

// Export functions
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  loginAccount,
  buildAccountManagement,
  logoutAccount,
  buildUpdateAccountView,
  buildUpdateAccount,
  updateAccountInfo,
  updateAccountPassword
}
