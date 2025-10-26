const accountModel = require("../models/account-model");

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount; // returns 0 if email doesn't exist, >0 if it does
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  ...module.exports,  // keep existing exports
  checkExistingEmail
};
