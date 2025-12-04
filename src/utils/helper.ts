// Helper to calculate total

import productRepository from "../modules/products/repository/product.repository";
import Apperror from "./apperror";

const parsePaperTextures = (value: any) => {
  if (!value) return [];
  let parsed: any = value;
  try {
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
  } catch (e) {
    // fallthrough to try array handling below
  }

  if (Array.isArray(parsed)) {
    const mapped = parsed
      .map((item: any) => {
        if (!item) return null;
        try {
          if (typeof item === "string") {
            item = JSON.parse(item);
          }
        } catch (e) {
          return null;
        }
        if (typeof item === "object") {
          return {
            name: item.name,
            rate: item.rate !== undefined ? Number(item.rate) : 0,
          };
        }
        return null;
      })
      .filter(Boolean);
    return mapped;
  }

  // single object
  if (typeof parsed === "object") {
    return [
      {
        name: parsed.name,
        rate: parsed.rate !== undefined ? Number(parsed.rate) : 0,
      },
    ];
  }

  return [];
};

const calculateCartTotal = async (cart: any) => {
  let total = 0;
  for (const item of cart.items) {
    const product = await productRepository.findById(item.product);
    if (!product) throw new Apperror("Product price not found", 404);
    total += product.price * item.quantity * (item.area || 1);
  }
  return total;
};
export { parsePaperTextures, calculateCartTotal };
