import { withStyles } from "@material-ui/core";

export const GlobalCss = withStyles({
  // @global is handled by jss-plugin-global.
  '@global': {
    // You should target [class*="MuiButton-root"] instead if you nest themes.
    // '.MuiButton-root': {
    //   fontSize: '2rem',
    // },
    '.MuiDialogTitle-root': {
      paddingLeft: '1rem'
    },
    form: {
      paddingLeft: '1rem',
      paddingRight: '1rem'
    },
    '.MuiDialogActions-root': {
      paddingTop: '1rem'
    },
    '.MuiButton-root': {
      borderRadius: '3em'
    },
  },
})(() => null);

