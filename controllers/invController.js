const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async (req, res, next) => {
  try {
    const classificationId = parseInt(req.params.classificationId);
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classificationId); // navbar dropdown

    const inventory = await invModel.getInventoryByClassificationId(classificationId);

    const grid = inventory.length
      ? await utilities.buildClassificationGrid(inventory)
      : "<p class='notice'>Sorry, no vehicles could be found.</p>";

    res.render("inventory/classification", {
      title: "Inventory By Classification",
      nav,
      classificationSelect,
      grid,
      messages: [],
      errors: []
    });
  } catch (error) {
    console.error("Error at buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory detail by inventory ID
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId);
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).render("errors/404", { title: "Vehicle Not Found" });
    }

    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // navbar dropdown
    const vehicleHTML = await utilities.buildVehicleDetail(vehicleData);

    res.render("inventory/detail", {
      title: vehicleData.inv_make + " " + vehicleData.inv_model,
      nav,
      classificationSelect,
      vehicleHTML,
    });
  } catch (error) {
    console.error("Error building vehicle detail:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // navbar dropdown

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      messages: [].concat(req.flash("success") || []),
      errors: []
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error);
  }
};

/* ***************************
 *  JSON inventory by classification
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    res.json(invData || []);
  } catch (error) {
    console.error("Error getting inventory JSON:", error);
    next(error);
  }
};

/* ***************************
 *  Build add-classification form
 * ************************** */
invCont.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: [].concat(req.flash("success") || []),
      errors: [],
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process add-classification
 * ************************** */
invCont.addClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body;
    const errors = validationResult(req);
    const nav = await utilities.getNav();

    if (!errors.isEmpty()) {
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        messages: [],
        errors: errors.array(),
        classification_name
      });
    }

    const addResult = await invModel.addClassification(classification_name);

    if (addResult) {
      req.flash("success", `${classification_name} was added.`);
      return res.redirect("/inv/");
    }

    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: [],
      errors: [{ msg: "Failed to add classification." }],
      classification_name
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build add-inventory form
 * ************************** */
invCont.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // navbar dropdown

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      messages: [].concat(req.flash("success") || []),
      errors: [],
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: ""
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process add-inventory
 * ************************** */
invCont.addInventory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // navbar dropdown

    const {
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
    } = req.body;

    if (!errors.isEmpty()) {
      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationSelect,
        messages: [],
        errors: errors.array(),
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
      });
    }

    const addResult = await invModel.addInventory(
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
    );

    if (addResult) {
      req.flash("success", `${inv_make} ${inv_model} was successfully added.`);
      return res.redirect("/inv/");
    }

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      messages: [],
      errors: [{ msg: "Failed to add inventory item." }],
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
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build edit-inventory view
 * ************************** */
invCont.editInventoryView = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      messages: [].concat(req.flash("notice") || []),
      classificationSelect,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error at editInventoryView:", error);
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  // Pull values from the request body
  const {
    inv_id,
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
  } = req.body;

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationSelect = await utilities.buildClassificationList(classification_id);

    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
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
    });
  }

  // Attempt update
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  // If update succeeded
  if (updateResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`);
    return res.redirect("/inv/");
  }

  // If update failed
  const classificationSelect = await utilities.buildClassificationList(classification_id);
  req.flash("notice", "Sorry, the update failed.");

  res.status(501).render("inventory/edit-inventory", {
    title: `Edit ${inv_make} ${inv_model}`,
    nav,
    classificationSelect,
    errors: [],
    inv_id,
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
  });
};

module.exports = invCont;
