import express from "express";
import cartController from "../controllers/cart.controller";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.use(verifyUser);
/**
 * @openapi
 * /api/v1/cart:
 *   post:
 *     summary: Add item to cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product added to cart
 *   get:
 *     summary: Get current user's cart
 *     tags:
 *       - Cart
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);
/**
 * @openapi
 * /api/v1/cart/{productId}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete("/:productId", cartController.removeFromCart);
export default router;
