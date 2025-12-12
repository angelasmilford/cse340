const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

const reviewController = {};

reviewController.addReview = async (req, res) => {
  const { inv_id, review_text, rating } = req.body;
  const account_id = res.locals.accountData.account_id;

  await reviewModel.addReview(inv_id, account_id, review_text, rating);

  req.flash("notice", "Review added!");
  res.redirect(`/inv/detail/${inv_id}`);
};

reviewController.deleteReview = async (req, res) => {
  const { review_id, inv_id } = req.body;
  const account_id = res.locals.accountData.account_id;

  await reviewModel.deleteReview(review_id, account_id);

  req.flash("notice", "Review deleted!");
  res.redirect(`/inv/detail/${inv_id}`);
};


module.exports = reviewController;
