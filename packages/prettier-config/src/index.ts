import { type Config } from 'prettier';

/**
 * @type {import("prettier").Config}
 */
const config: Config = {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  singleQuote: true,
  arrowParens: 'always',
  printWidth: 120,
  trailingComma: 'es5',

  overrides: [
    {
      files: '*.html',
      options: {
        singleQuote: false,
      },
    },
  ],
};

export default config;
