const path = require("path");
const config = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "xhook.js"
  },
  devtool: "source-map",
  devServer: {
    publicPath: "/dist/",
    writeToDisk: true,
    port: 3000
  }
};
module.exports = config;
