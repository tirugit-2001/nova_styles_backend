import express from "express";
import upload from "../../../middlewares/upload";
import productController from "../controllers/product.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.post(
  "/",

  upload.single("image"),
  productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", verifyUser, verifyAdmin, productController.updateProduct);
router.delete("/:id", verifyUser, verifyAdmin, productController.deleteProduct);
export default router;
//   verifyAdmin,
//  verifyUser,
