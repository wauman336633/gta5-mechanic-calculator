import js from '@eslint/js';
import pluginSecurity from 'eslint-plugin-security';
import pluginNoUnsanitized from 'eslint-plugin-no-unsanitized';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    plugins: {
      security: pluginSecurity,
      'no-unsanitized': pluginNoUnsanitized
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        AppCommon: 'writable',
        AppPrices: 'writable',
        AppStorage: 'writable',
        AppPortal: 'writable',
        AppRepair: 'writable',
        AppCustom: 'writable',
        AppBuyback: 'writable',
        AppSettings: 'writable',
        AppRegister: 'writable',
        firebase: 'readonly',
        db: 'writable',
        auth: 'writable',
        googleProvider: 'writable',
        DEFAULT_PASSCODE_HASH: 'readonly',
        CURRENT_SHOP_ID: 'writable',
        IS_DEFAULT_SHOP: 'writable',
        SHOP_CONFIG: 'writable'
      }
    },
    rules: {
      ...pluginSecurity.configs.recommended.rules,
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-console': 'off',
      'security/detect-object-injection': 'off' // オブジェクトの動的プロパティアクセス（価格表検索等）で過剰検知を防ぐためoff
    }
  },
  {
    ignores: [
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'tests/serve.js'
    ]
  }
];
