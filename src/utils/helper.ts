// Helper to calculate total

export const calculateCartTotal = (cart: any) => {
  return cart.items.reduce(
    (total: number, item: any) => total + item.product.price * item.quantity,
    0
  );
};
