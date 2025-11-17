const pool = require("../database/"); // PostgreSQL connection

const invModel = {};

/* ***************************
 * Get all classifications
 * ************************** */
invModel.getClassifications = async function () {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return data.rows; // return rows directly
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
};

/* ***************************
 * Get inventory by classification
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1
       ORDER BY inv_make, inv_model`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
};

/* ***************************
 * Get inventory by ID
 * ************************** */
invModel.getInventoryById = async function (inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // single vehicle
  } catch (error) {
    console.error("getInventoryById error:", error);
    throw error;
  }
};

// Alias for backward compatibility with older controllers
invModel.getVehicleById = invModel.getInventoryById;

/* ***************************
 * Add new classification
 * ************************** */
invModel.addClassification = async function (classification_name) {
  try {
    const data = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
    );
    return data.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
};

/* ***************************
 * Add new inventory item
 * ************************** */
invModel.addInventory = async function (
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const data = await pool.query(
      `INSERT INTO public.inventory
       (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
};

/* ***************************
 * Update inventory item
 * ************************** */
invModel.updateInventory = async function (inv) {
  try {
    const data = await pool.query(
      `UPDATE public.inventory SET
        inv_make=$1, inv_model=$2, inv_year=$3, inv_description=$4,
        inv_image=$5, inv_thumbnail=$6, inv_price=$7, inv_miles=$8,
        inv_color=$9, classification_id=$10
       WHERE inv_id=$11
       RETURNING *`,
      [
        inv.inv_make, inv.inv_model, inv.inv_year, inv.inv_description,
        inv.inv_image, inv.inv_thumbnail, inv.inv_price, inv.inv_miles,
        inv.inv_color, inv.classification_id, inv.inv_id
      ]
    );
    return data.rows[0];
  } catch (error) {
    console.error("updateInventory error:", error);
    throw error;
  }
};

module.exports = invModel;
