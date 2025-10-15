import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NovaStyles API",
      version: "1.0.0",
      description: "API documentation for NovaStyles",
    },
    servers: [
      {
        url: "http://localhost:8500/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken", // Your cookie name
          description: "Access token stored in HTTP-only cookie",
        },
        // Optional: Keep bearer auth as backup if you support both
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token (alternative to cookie)",
        },
      },
    },
    // Default security - use cookie auth
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "../modules/auth/routes/*.js"),
    path.join(__dirname, "../modules/cart/routes/*.js"),
    path.join(__dirname, "../modules/products/routes/*.js"),
  ],
};

console.log("Swagger API paths:", [
  path.join(__dirname, "../modules/auth/routes/*.js"),
  path.join(__dirname, "../modules/cart/routes/*.js"),
  path.join(__dirname, "../modules/products/routes/*.js"),
]);

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
