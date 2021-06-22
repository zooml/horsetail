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
    '.pubContent': {
      backgroundImage: 'url(/static/img/horsetail-grass.jpg)'
    },
    '.appMenu': {
      width: '30em',
      maxWidth: '30em'
    },
    '.userCtl': {
      width: '8em'
    },
    '.userMenu': {
      width: '20em'
    },
    '.MuiListItemIcon-root': {  // for menus
      minWidth: '30px'
    },
    '.menuItemNoIcon': {
      minWidth: '30px'
    }
  },
})(() => null);

