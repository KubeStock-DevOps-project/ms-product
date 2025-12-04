const express = require("express");
const router = express.Router();
const productRatingController = require("../controllers/productRating.controller");
const { authenticate } = require("../middlewares/token.middleware");

// Supplier routes (protected)
router.post(
  "/:productId/rate",
  authenticate,
  productRatingController.rateProduct
);

router.get(
  "/my-ratings",
  authenticate,
  productRatingController.getMyRatings
);

// Public routes
router.get("/:productId/ratings", productRatingController.getProductRatings);

module.exports = router;
