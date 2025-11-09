const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 * Build inventory by classification view
 * ***************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 * Build inventory by inventory ID
 * ***************************/
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

/* ***************************
 * Build inventory management view
 * ***************************/
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("success") || [],
    });
  } catch (error) {
    console.error("Error building management view: " + error);
    next(error);
  }
};

/* ***************************
 * Render add-classification view
 * ***************************/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("success") || [],
      errors: [],
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Process add-classification form
 * ***************************/
invCont.addClassification = async function (req, res, next) {
  const errors = validationResult(req);
  const { classification_name } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors: errors.array(),
      classification_name
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);
    if (result.rowCount > 0) {
      req.flash("success", `${classification_name} added successfully`);
      return res.redirect("/inv");
    } else {
      const nav = await utilities.getNav();
      return res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: [],
        errors: [{ msg: "Failed to add classification." }],
        classification_name
      });
    }
  } catch (error) {
    const nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: [],
      errors: [{ msg: error.message }],
      classification_name
    });
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      messages: req.flash("success") || [],
      errors: [],
      // pass any sticky fields if needed
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Render add-inventory view
 * ***************************/
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      messages: req.flash("success") || [],
      errors: [],
      // Sticky form fields
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Process add-inventory form
 * ***************************/
invCont.addInventory = async function (req, res, next) {
  const errors = validationResult(req);
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body;

  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(classification_id);

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      messages: [],
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });
  }

  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });

    if (result.rowCount > 0) {
      req.flash("success", `${inv_make} ${inv_model} added successfully`);
      res.redirect("/inv");
    } else {
      res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationSelect,
        messages: [],
        errors: [{ msg: "Failed to add inventory item." }],
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
