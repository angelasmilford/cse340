// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:invId", invController.buildByInventoryId);

// Route for testing error handling
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

module.exports = router;