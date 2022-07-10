const webpack = require("webpack");
const banner = new webpack.BannerPlugin({
  banner:
    `XHook - v${require("./package.json").version} - ` +
    "https://github.com/jpillora/xhook\n" +
    `Jaime Pillora <dev@jpillora.com> - ` +
    `MIT Copyright ${new Date().getFullYear()}`
});
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
    port: 3000
  },
  plugins: [banner]
};
module.exports = config;
