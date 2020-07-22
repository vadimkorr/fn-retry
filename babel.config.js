module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
          node: true,
        },
      },
    ],
  ],
  plugins: ['@babel/transform-runtime'],
}
