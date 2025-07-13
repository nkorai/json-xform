module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2020: true
  },
  // No global parser or parserOptions!
  plugins: ['@typescript-eslint'],
  extends: ['standard'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off' // relaxed globally for now
  },
  overrides: [
    {
      files: ['*.ts', '**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        semi: ['error', 'always']
      }
    },
    {
      plugins: ['chai-friendly'],
      extends: ['plugin:chai-friendly/recommended'],
      files: ['*.test.ts', '**/*.test.ts'],
      rules: {
        'no-template-curly-in-string': 'off',
        'no-unused-expressions': 'off',
        'n/no-path-concat': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-redeclare': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/no-unused-expressions': 'off'
      }
    },
    {
      files: ['*.test.js', '**/*.test.js'],
      rules: {
        'no-template-curly-in-string': 'off',
        'no-unused-expressions': 'off',
        'n/no-path-concat': 'off'
      }
    },
    {
      files: ['*.js', '**/*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    }
  ]
}
