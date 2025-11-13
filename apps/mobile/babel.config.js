module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            '@mk/tokens': '../../packages/tokens/src',
            '@mk/ui': '../../packages/ui/src',
            '@mk/api-client': '../../packages/api-client/src',
            '@mk/practice': '../../packages/practice/src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
