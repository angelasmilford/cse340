const pool = require("../database/");

/* ============================
   Get all reviews for a vehicle
   ============================ */
async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `
      SELECT r.review_id,
             r.inv_id,
             r.account_id,
             r.review_text,
             r.review_date,
             a.account_firstname,
             a.account_lastname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  } catch (error) {
    console.error("getReviewsByVehicle error:", error);
    throw error;
  }
}


/* ============================
   Add a new review
   ============================ */
async function addReview(inv_id, account_id, review_text) {
  try {
    const sql = `
      INSERT INTO review (inv_id, account_id, review_text)
      VALUES ($1, $2, $3)
      RETURNING review_id
    `;
    const data = await pool.query(sql, [
      inv_id,
      account_id,
      review_text
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("addReview error:", error);
    throw error;
  }
}


/* ============================
   Delete review (only by owner)
   ============================ */
async function deleteReview(review_id, account_id) {
  try {
    const sql = `
      DELETE FROM review
      WHERE review_id = $1 AND account_id = $2
      RETURNING review_id
    `;
    const data = await pool.query(sql, [review_id, account_id]);
    return data.rows[0]; // undefined if user does NOT own review
  } catch (error) {
    console.error("deleteReview error:", error);
    throw error;
  }
}

/* ============================
   Get all reviews for a user's account
   (for "Account Management" page)
   ============================ */
async function getReviewsByAccount(account_id) {
  try {
    const sql = `
      SELECT r.review_id,
             r.inv_id,
             r.review_text,
             r.rating,
             r.review_date,
             i.inv_make,
             i.inv_model
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `;
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    console.error("getReviewsByAccount error:", error);
    throw error;
  }
}

module.exports = {
  getReviewsByVehicle,
  addReview,
  deleteReview,
  getReviewsByAccount,
};
