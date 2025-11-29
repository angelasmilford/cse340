const pool = require("../database/");

/**********************
 * Check for existing email
 **********************/
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_email FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount; // 0 if not exists, >0 if exists
  } catch (error) {
    console.error("checkExistingEmail error:", error);
    throw error;
  }
}

/******************************
 * Register new account
 ******************************/
async function accountRegister(firstname, lastname, email, hashedPassword) {
  try {
    const sql = `INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
                 VALUES ($1, $2, $3, $4) RETURNING account_id`;
    const result = await pool.query(sql, [firstname, lastname, email, hashedPassword]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("accountRegister error:", error);
    throw error;
  }
}

/******************************
 * Get account by email
 ******************************/
async function getAccountByEmail(account_email) {
  try {
    const sql = `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
                 FROM account WHERE account_email = $1`;

    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error:", error);
    throw error;
  }
}

async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1";
  const result = await pool.query(sql, [account_id]);
  return result.rows[0];
}

async function updateAccount(id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
    RETURNING *;
  `;
  const result = await pool.query(sql, [firstname, lastname, email, id]);
  return result.rowCount;
}

async function updatePassword(id, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
    RETURNING *;
  `;
  const result = await pool.query(sql, [hashedPassword, id]);
  return result.rowCount;
}

module.exports = {
  checkExistingEmail,
  accountRegister,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
