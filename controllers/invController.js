const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

// Build inventory management view
invCont.buildManagementView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // returns <option> elements

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("success") || [],
      classificationSelect
    });
  } catch (error) {
    console.error("Error building management view: ", error);
    next(error);
  }
};

// Return inventory items by classification as JSON
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);

  if (invData && invData.length > 0) {
    res.json(invData); // <-- send array of vehicles directly
  } else {
    res.json([]); // send empty array if none
  }
};

module.exports = invCont;
