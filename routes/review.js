const express = require("express");
const router = express.Router({mergeParams: true});// imp. 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")


const reviewController = require("../controllers/review.js");
const review = require("../models/review.js");



//post route
router.post("/",isLoggedIn,validateReview ,wrapAsync (reviewController.createReview));


// delete route for reviews
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destoryReview) );

module.exports = router;