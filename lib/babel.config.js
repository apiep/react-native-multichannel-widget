module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // 'module:metro-react-native-babel-preset',
      // ["@babel/preset-env", { modules: false }],
      // "@babel/preset-react"
    ],
  };
};
