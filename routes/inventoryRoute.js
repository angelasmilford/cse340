const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const { body } = require("express-validator");
const invValidate = require("../utilities/inventory-validation");

// Inventory Management View
router.get(
  "/",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
);

// Render add-classification form
router.get(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

// Process add-classification form
router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
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
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
);

// Process add-inventory form
router.post(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Fetch inventory items by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to display edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

// Process update-inventory form
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete view
router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryView)
);

// Delete action
router.post(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;