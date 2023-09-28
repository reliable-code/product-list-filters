module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: 'off',
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'operator-linebreak': 'off',
    'function-paren-newline': ['error', 'consistent'],
  },
};
