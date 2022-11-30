const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@contracts": path.resolve(__dirname, "src/contracts"),
      // "@/contracts/*": path.resolve(__dirname, "src/contracts/*"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
};
