import { createGlobalStyle, css } from 'styled-components'
import { ThemeType } from 'grommet'

const colorPalate = css`
  --md-source: #8cc43c;
  /* primary */
  --md-ref-palette-primary0: #000000;
  --md-ref-palette-primary10: #112000;
  --md-ref-palette-primary20: #203600;
  --md-ref-palette-primary25: #294200;
  --md-ref-palette-primary30: #314f00;
  --md-ref-palette-primary35: #3a5c00;
  --md-ref-palette-primary40: #436900;
  --md-ref-palette-primary50: #558400;
  --md-ref-palette-primary60: #6b9f16;
  --md-ref-palette-primary70: #84bb34;
  --md-ref-palette-primary80: #9ed84e;
  --md-ref-palette-primary90: #b9f567;
  --md-ref-palette-primary95: #d3ff96;
  --md-ref-palette-primary98: #f0ffd5;
  --md-ref-palette-primary99: #f9ffe8;
  --md-ref-palette-primary100: #ffffff;
  /* secondary */
  --md-ref-palette-secondary0: #000000;
  --md-ref-palette-secondary10: #161e0b;
  --md-ref-palette-secondary20: #2a331e;
  --md-ref-palette-secondary25: #353e28;
  --md-ref-palette-secondary30: #414a33;
  --md-ref-palette-secondary35: #4c563e;
  --md-ref-palette-secondary40: #586249;
  --md-ref-palette-secondary50: #717b60;
  --md-ref-palette-secondary60: #8a9479;
  --md-ref-palette-secondary70: #a5af92;
  --md-ref-palette-secondary80: #c0cbac;
  --md-ref-palette-secondary90: #dce7c7;
  --md-ref-palette-secondary95: #eaf5d5;
  --md-ref-palette-secondary98: #f3fedd;
  --md-ref-palette-secondary99: #f9ffe8;
  --md-ref-palette-secondary100: #ffffff;
  /* tertiary */
  --md-ref-palette-tertiary0: #000000;
  --md-ref-palette-tertiary10: #00201e;
  --md-ref-palette-tertiary20: #003734;
  --md-ref-palette-tertiary25: #11423f;
  --md-ref-palette-tertiary30: #1f4e4b;
  --md-ref-palette-tertiary35: #2c5a56;
  --md-ref-palette-tertiary40: #386662;
  --md-ref-palette-tertiary50: #527f7b;
  --md-ref-palette-tertiary60: #6b9995;
  --md-ref-palette-tertiary70: #85b4af;
  --md-ref-palette-tertiary80: #a0d0cb;
  --md-ref-palette-tertiary90: #bcece7;
  --md-ref-palette-tertiary95: #cafaf5;
  --md-ref-palette-tertiary98: #e4fffb;
  --md-ref-palette-tertiary99: #f2fffc;
  --md-ref-palette-tertiary100: #ffffff;
  /* neutral */
  --md-ref-palette-neutral0: #000000;
  --md-ref-palette-neutral10: #1b1c18;
  --md-ref-palette-neutral20: #30312c;
  --md-ref-palette-neutral25: #3b3c37;
  --md-ref-palette-neutral30: #464742;
  --md-ref-palette-neutral35: #52534d;
  --md-ref-palette-neutral40: #5e5f59;
  --md-ref-palette-neutral50: #777771;
  --md-ref-palette-neutral60: #91918b;
  --md-ref-palette-neutral70: #acaca5;
  --md-ref-palette-neutral80: #c7c7c0;
  --md-ref-palette-neutral90: #e3e3db;
  --md-ref-palette-neutral95: #f2f1e9;
  --md-ref-palette-neutral98: #fbfaf2;
  --md-ref-palette-neutral99: #fefcf5;
  --md-ref-palette-neutral100: #ffffff;
  /* neutral-variant */
  --md-ref-palette-neutral-variant0: #000000;
  --md-ref-palette-neutral-variant10: #191d14;
  --md-ref-palette-neutral-variant20: #2e3227;
  --md-ref-palette-neutral-variant25: #393d32;
  --md-ref-palette-neutral-variant30: #44483d;
  --md-ref-palette-neutral-variant35: #505448;
  --md-ref-palette-neutral-variant40: #5c6054;
  --md-ref-palette-neutral-variant50: #75796c;
  --md-ref-palette-neutral-variant60: #8f9285;
  --md-ref-palette-neutral-variant70: #a9ad9f;
  --md-ref-palette-neutral-variant80: #c5c8b9;
  --md-ref-palette-neutral-variant90: #e1e4d5;
  --md-ref-palette-neutral-variant95: #eff2e3;
  --md-ref-palette-neutral-variant98: #f8fbeb;
  --md-ref-palette-neutral-variant99: #fbfeee;
  --md-ref-palette-neutral-variant100: #ffffff;
  /* error */
  --md-ref-palette-error0: #000000;
  --md-ref-palette-error10: #410002;
  --md-ref-palette-error20: #690005;
  --md-ref-palette-error25: #7e0007;
  --md-ref-palette-error30: #93000a;
  --md-ref-palette-error35: #a80710;
  --md-ref-palette-error40: #ba1a1a;
  --md-ref-palette-error50: #de3730;
  --md-ref-palette-error60: #ff5449;
  --md-ref-palette-error70: #ff897d;
  --md-ref-palette-error80: #ffb4ab;
  --md-ref-palette-error90: #ffdad6;
  --md-ref-palette-error95: #ffedea;
  --md-ref-palette-error98: #fff8f7;
  --md-ref-palette-error99: #fffbff;
  --md-ref-palette-error100: #ffffff;
  /* light */
  --md-sys-color-primary-light: #436900;
  --md-sys-color-on-primary-light: #ffffff;
  --md-sys-color-primary-container-light: #b9f567;
  --md-sys-color-on-primary-container-light: #112000;
  --md-sys-color-secondary-light: #586249;
  --md-sys-color-on-secondary-light: #ffffff;
  --md-sys-color-secondary-container-light: #dce7c7;
  --md-sys-color-on-secondary-container-light: #161e0b;
  --md-sys-color-tertiary-light: #386662;
  --md-sys-color-on-tertiary-light: #ffffff;
  --md-sys-color-tertiary-container-light: #bcece7;
  --md-sys-color-on-tertiary-container-light: #00201e;
  --md-sys-color-error-light: #ba1a1a;
  --md-sys-color-error-container-light: #ffdad6;
  --md-sys-color-on-error-light: #ffffff;
  --md-sys-color-on-error-container-light: #410002;
  --md-sys-color-background-light: #fefcf5;
  --md-sys-color-on-background-light: #1b1c18;
  --md-sys-color-surface-light: #fefcf5;
  --md-sys-color-on-surface-light: #1b1c18;
  --md-sys-color-surface-variant-light: #e1e4d5;
  --md-sys-color-on-surface-variant-light: #44483d;
  --md-sys-color-outline-light: #75796c;
  --md-sys-color-inverse-on-surface-light: #f2f1e9;
  --md-sys-color-inverse-surface-light: #30312c;
  --md-sys-color-inverse-primary-light: #9ed84e;
  --md-sys-color-shadow-light: #000000;
  --md-sys-color-surface-tint-light: #436900;
  --md-sys-color-outline-variant-light: #c5c8b9;
  --md-sys-color-scrim-light: #000000;
  /* dark */
  --md-sys-color-primary-dark: #9ed84e;
  --md-sys-color-on-primary-dark: #203600;
  --md-sys-color-primary-container-dark: #314f00;
  --md-sys-color-on-primary-container-dark: #b9f567;
  --md-sys-color-secondary-dark: #c0cbac;
  --md-sys-color-on-secondary-dark: #2a331e;
  --md-sys-color-secondary-container-dark: #414a33;
  --md-sys-color-on-secondary-container-dark: #dce7c7;
  --md-sys-color-tertiary-dark: #a0d0cb;
  --md-sys-color-on-tertiary-dark: #003734;
  --md-sys-color-tertiary-container-dark: #1f4e4b;
  --md-sys-color-on-tertiary-container-dark: #bcece7;
  --md-sys-color-error-dark: #ffb4ab;
  --md-sys-color-error-container-dark: #93000a;
  --md-sys-color-on-error-dark: #690005;
  --md-sys-color-on-error-container-dark: #ffdad6;
  --md-sys-color-background-dark: #1b1c18;
  --md-sys-color-on-background-dark: #e3e3db;
  --md-sys-color-surface-dark: #1b1c18;
  --md-sys-color-on-surface-dark: #e3e3db;
  --md-sys-color-surface-variant-dark: #44483d;
  --md-sys-color-on-surface-variant-dark: #c5c8b9;
  --md-sys-color-outline-dark: #8f9285;
  --md-sys-color-inverse-on-surface-dark: #1b1c18;
  --md-sys-color-inverse-surface-dark: #e3e3db;
  --md-sys-color-inverse-primary-dark: #436900;
  --md-sys-color-shadow-dark: #000000;
  --md-sys-color-surface-tint-dark: #9ed84e;
  --md-sys-color-outline-variant-dark: #44483d;
  --md-sys-color-scrim-dark: #000000;
`

const lightTheme = css`
  ${colorPalate};

  /* primary */
  --primary: var(--md-ref-palette-primary40);
  --on-primary: var(--md-ref-palette-primary100);
  --primary-container: var(--md-ref-palette-primary90);
  --on-primary-container: var(--md-ref-palette-primary10);

  /* secondary */
  --secondary: var(--md-ref-palette-secondary40);
  --on-secondary: var(--md-ref-palette-secondary100);
  --secondary-container: var(--md-ref-palette-secondary90);
  --on-secondary-container: var(--md-ref-palette-secondary10);

  /* neutral */
  --background: var(--md-ref-palette-neutral99);
  --on-background: var(--md-ref-palette-neutral10);
  --surface-variant: var(--md-ref-palette-neutral-variant90);
  --on-surface-variant: var(--md-ref-palette-neutral-variant30);
  --outline: var(--md-ref-palette-neutral-variant50);
  --outline-variant: var(--md-ref-palette-neutral-variant80);

  /* error */
  --error: var(--md-ref-palette-error40);
  --on-error: var(--md-ref-palette-error100);
  --error-container: var(--md-ref-palette-error90);
  --on-error-container: var(--md-ref-palette-error10);
`

// noinspection CssInvalidPropertyValue
const GlobalStyle = createGlobalStyle`
  html {
    height: -webkit-fill-available;
  }
  
  body {
    ${lightTheme};
    
    font-family: "Lato", sans-serif;
    background: var(--background);

    display: flex;
    margin: 0;
    min-height: 100vh;
    min-height: -webkit-fill-available;
    width: 100vh;
    width: -webkit-fill-available;
  }
  
  #root {
    display: flex;
    flex-grow: 1;
    max-width: 100%;

    > div {
      display: flex;
      flex-grow: 1;
      max-width: 100%;
    }
  }
`

export const theme: ThemeType = {
  global: {
    font: { family: 'Lato, sans-serif' },
    colors: {
      brand: 'var(--main)',
      'accent-1': 'var(--accent1)',
      'accent-2': 'var(--accent2)',
      muted: 'var(--muted)',
      border: 'var(--outline-variant)',
      'status-error': 'var(--error)',
    },
  },
  checkBox: {
    color: 'var(--primary)',
  },
  dataTable: {
    pinned: { header: { background: 'var(--background)' } },
    body: {
      extend: css`
        tr:nth-of-type(odd) {
          background: var(--md-ref-palette-neutral95);
        }
        tr:nth-of-type(even) {
          background: var(--md-ref-palette-neutral98);
        }
      `,
    },
  },
  card: {
    container: {
      background: 'var(--surface-variant)',
      margin: 'small',
      pad: 'medium',
      round: 'small',
      elevation: 'none',
      extend: css`
        //color: var(--on-surface-variant);
      `,
    },
  },
  layer: {
    background: 'var(--background)',
  },
  button: {
    primary: {
      background: 'var(--primary)',
      font: { weight: 400 },
      extend: css`
        color: var(--on-primary);
        transition: opacity 0.2s;
      `,
    },
    default: {
      background: 'var(--secondary-container)',
      font: { weight: 400 },
      extend: css`
        color: var(--on-secondary-container);
        transition: opacity 0.2s;
      `,
    },
    secondary: {
      border: { color: 'var(--primary)', width: '1px' },
      font: { weight: 400 },
      extend: css`
        color: var(--primary);
        transition: opacity 0.2s;
      `,
    },
    hover: {
      extend: css`
        opacity: 0.8;
        transition: opacity 0.1s;
      `,
    },
  },
}

export default GlobalStyle
