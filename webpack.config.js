const path = require("path");

module.exports = {
  entry: "./src/index.js", // Entry point of your library
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    library: "Vibe", // Name of your library
    libraryTarget: "umd", // This makes it usable as a module and script
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    open: true, // Automatically opens the browser
    hot: true, // Enable Hot Module Replacement
  },
  mode: "development", // Development mode for better debugging
};
