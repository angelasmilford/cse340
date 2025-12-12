const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Only logged-in users can submit
router.post(
  "/add",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.addReview)
);

router.get("/add/:inv_id", utilities.checkLogin, async (req, res, next) => {
  const { inv_id } = req.params;
  try {
    res.render("reviews/add", {
      title: "Add a Review",
      inv_id
    });
  } catch (error) {
    next(error);
  }
});

router.post("/delete", utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview));


module.exports = router;
