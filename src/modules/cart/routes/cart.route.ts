import express from "express";
import verifyUser from "../../../middlewares/verifyUser";
import cartController from "../controllers/cart.controller";

const router = express.Router();
router.use(verifyUser);

/**
 * @openapi
 * /api/v1/cart:
 *   post:
 *     summary: Add item to cart
 *   get:
 *     summary: Get user's cart
 */
router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);

/**
 * @openapi
 * /api/v1/cart/{productId}:
 *   delete:
 *     summary: Remove item from cart
 */
router.delete("/:productId", cartController.removeFromCart);

/**
 * @openapi
 * /api/v1/cart/update:
 *   put:
 *     summary: Update item quantity
 */

/**
 * @openapi
 * /api/v1/cart/merge:
 *   post:
 *     summary: Merge guest cart into user's cart
 */
router.post("/merge", cartController.mergeCart);

export default router;
