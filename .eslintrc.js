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
        indent: ['error', 4],
        'no-use-before-define': ['error', {
            functions: false,
            classes: false,
        }],
        'import/prefer-default-export': 'off',
        'operator-linebreak': 'off',
        'function-paren-newline': ['error', 'consistent'],
        'no-param-reassign': 'off',
        'import/no-extraneous-dependencies': ['off', { devDependencies: true }],
    },
};
