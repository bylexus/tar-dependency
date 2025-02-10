import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import json from 'eslint-plugin-json';

// eslint.config.js
export default [
    eslintPluginPrettierRecommended,
	{
		files: ["**/*.json"],
		...json.configs["recommended"]
	  },
    {
        // extends: ['prettier', 'plugin:json/recommended'],
        languageOptions: {
            ecmaVersion: 2017
        },
        // env: {
        //     node: true
        // },
        // plugins: ['prettier', 'json'],
        rules: {
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    tabWidth: 4,
                    printWidth: 120
                }
            ],
            'no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'none'
                }
            ],
            semi: ['error', 'always'],
            curly: 'error',
            eqeqeq: 'error',
            'no-eval': 'error',
            'no-loop-func': 'error',
            radix: 'error',
            'comma-dangle': 'error',
            'no-undef': 'error'
        }
    }
];
