const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;

  try {
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).render("errors/404", { title: "Vehicle Not Found" });
    }

    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData);
    const nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: vehicleData.inv_make + " " + vehicleData.inv_model,
      nav,
      vehicleHTML,
    });
  } catch (error) {
    console.error("Error building vehicle detail: " + error);
    next(error);
  }
};

invCont.triggerError = async function (req, res, next) {
  // Simulate a 500 server error
  throw new Error("Intentional 500 error for testing");
};


module.exports = invCont