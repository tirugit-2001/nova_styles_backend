import express from "express";
import upload from "../../../middlewares/upload";
import productController from "../controllers/product.controller";
const router = express.Router();
/**
 * @openapi
 * /api/v1/product:
 *   post:
 *     summary: Create a product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *   get:
 *     summary: Get list of products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
/**
 * @openapi
 * /api/v1/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
export default router;
upload.single("image");
