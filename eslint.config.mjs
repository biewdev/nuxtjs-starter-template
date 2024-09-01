// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import prettierPlugin from 'eslint-plugin-prettier';

const ignores = ['*.md', '**/.config.ts', 'tailwind.config.ts', 'yarn.lock'];

export default withNuxt({
  ignores,
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    ...eslintConfigPrettier.rules,
    ...eslintPluginPrettierRecommended.rules,
    'vue/max-attributes-per-line': ['warn', { singleline: 3, multiline: 3 }],
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/require-prop-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/no-use-v-if-with-v-for': 'warn',
  },
}).prepend({ ignores });
