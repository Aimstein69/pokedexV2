require("dotenv").config();
const express = require("express");

const app = express();

// Test simple pour vérifier les routes
const userRoutes = require("./routes/users");

app.use("/api/users", userRoutes);

// Afficher les routes
function listRoutes(use_prefix = '') {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // express Route
      console.log(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // express Router
      const prefix = middleware.regexp
        .source
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '')
        .slice(1, -4);

      middleware.handle.stack.forEach((handler) => {
        const routes = handler.route;
        if (routes) {
          console.log(
            `${Object.keys(routes.methods)[0].toUpperCase()} /${prefix}${routes.path}`
          );
        }
      });
    }
  });
}

console.log("Routes montées:");
listRoutes();
