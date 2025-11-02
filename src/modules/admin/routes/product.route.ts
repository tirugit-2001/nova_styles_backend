import express from "express";

import upload from "../../../middlewares/upload";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import productController from "../../products/controllers/product.controller";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.post(
  "/",
  verifyUser,
  verifyAdmin,
  upload.single("image"),
  productController.createProduct
);
router.get("/", verifyUser, verifyAdmin, productController.getProducts);
router.get("/:id", verifyUser, verifyAdmin, productController.getProductById);
router.put(
  "/:id",
  verifyUser,
  verifyAdmin,
  upload.single("image"),
  productController.updateProduct
);
router.delete("/:id", verifyUser, verifyAdmin, productController.deleteProduct);
export default router;
