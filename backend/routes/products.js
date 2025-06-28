const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

// GET all products with reviews
router.get('/', async (req, res) => {
  const products = await Product.find().populate('reviews');
  res.json(products);
});

// POST new product
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const newProduct = new Product({ name, description });
  await newProduct.save();
  res.json(newProduct);
});

// POST new review for a product
router.post('/:id/reviews', async (req, res) => {
  const { username, rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  const review = new Review({ username, rating, comment, product: product._id });
  await review.save();
  product.reviews.push(review);
  await product.save();
  res.json(review);
});

// PATCH: Partial update to a review
router.patch('/:productId/reviews/:reviewId', async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  review.rating = rating;
  review.comment = comment;
  await review.save();
  res.json(review);
});

// PUT: Full update to a review
router.put('/:productId/reviews/:reviewId', async (req, res) => {
  const { username, rating, comment } = req.body;
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // PUT replaces the entire review object
    review.username = username;
    review.rating = rating;
    review.comment = comment;

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review with PUT' });
  }
});

// DELETE a review
router.delete('/:productId/reviews/:reviewId', async (req, res) => {
  const { productId, reviewId } = req.params;
  try {
    await Review.findByIdAndDelete(reviewId);
    await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: reviewId }
    });
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
