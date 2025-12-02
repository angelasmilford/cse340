const { body, validationResult } = require("express-validator");
const utilities = require("./");

/* ************************************
 *  Classification Rules
 * ************************************/
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .isAlpha()
      .withMessage("Classification name must contain only letters.")
  ];
};

/* ************************************
 *  Inventory Rules (Add + Update)
 * ************************************/
const inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please provide a valid image path."),

    body("inv_thumbnail")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please provide a valid thumbnail path."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative number."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),

    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please choose a classification.")
  ];
};

/* ************************************
 *  Handle Validation Errors
 * ************************************/
const checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req);
  const nav = await utilities.getNav();

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

  // Determine which view to render (add or edit)
  const isEdit = Boolean(inv_id);
  const view = isEdit ? "inventory/edit-inventory" : "inventory/add-inventory";
  const title = isEdit
    ? `Edit ${inv_make} ${inv_model}`
    : "Add New Vehicle";

  if (!errors.isEmpty()) {
    const classificationSelect =
      await utilities.buildClassificationList(classification_id);

    return res.render(view, {
      title,
      nav,
      errors: errors.array(),
      classificationSelect,
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

  next();
};

module.exports = {
  classificationRules,
  inventoryRules,
  checkInventoryData
};
