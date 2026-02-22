/**@style {import('tailwindcss').Config} */

export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss', // adds Tailwind’s at‑rules
  ],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },
};
