const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const { body } = require("express-validator");

// Inventory Management View
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Render add-classification form
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Process add-classification form
router.post(
  "/add-classification",
  [
    body("classification_name")
      .trim()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters")
      .notEmpty()
      .withMessage("Classification name is required"),
  ],
  utilities.handleErrors(invController.addClassification)
);

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Render add-inventory form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Process add-inventory form
router.post(
  "/add-inventory",
  [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Valid year required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Valid price required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Valid mileage required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").notEmpty().withMessage("Classification is required.")
  ],
  utilities.handleErrors(invController.addInventory)
);

// Fetch inventory items by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to display edit inventory view
router.get('/edit/:inv_id', utilities.handleErrors(invController.editInventoryView));

// Process update-inventory form
router.post(
  "/update",
  [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Valid year required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Valid price required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Valid mileage required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").notEmpty().withMessage("Classification is required.")
  ],
  utilities.handleErrors(invController.updateInventory)
);

// Delete view
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventoryView)
)

// Delete action
router.post(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;
