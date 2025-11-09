const pool = require("../database/");

const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
};

/* ***************************
 *  Get a single vehicle by inventory_id
 * ************************** */
invModel.getVehicleById = async function (inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Return single vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
};

/* ***************************
 *  Add a new classification
 * ************************** */
invModel.addClassification = async function (classification_name) {
  const sql = "INSERT INTO public.classification (classification_name) VALUES ($1)";
  const values = [classification_name];
  return await pool.query(sql, values);
};

/* ***************************
 *  Add a new inventory item
 * ***************************/
invModel.addInventory = async function (vehicleData) {
  const sql = `
    INSERT INTO public.inventory
    (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;
  const values = [
    vehicleData.inv_make,
    vehicleData.inv_model,
    vehicleData.inv_year,
    vehicleData.inv_description,
    vehicleData.inv_image,
    vehicleData.inv_thumbnail,
    vehicleData.inv_price,
    vehicleData.inv_miles,
    vehicleData.inv_color,
    vehicleData.classification_id,
  ];

  return await pool.query(sql, values);
};

module.exports = invModel;
