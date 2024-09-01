import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default <Partial<Config>>{
  content: ['./src/**/*.vue'],
  theme: {
    // fontFamily: {
    //   sans: ['"Poppins", sans-serif'],
    // },
    extend: {
      screens: {
        '2xl': '1336px',
        '3xl': '1440px',
        '4xl': '1600px',
      },
    },
  },
};
