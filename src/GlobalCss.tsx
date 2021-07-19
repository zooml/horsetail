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
    '.MuiToolbar-gutters': {
      paddingLeft: '1em',
      paddingRight: '1em',
    },
    '.MuiToolbar-regular': { // need since it somehow changes to 64 with drawer out
      minHeight: '56px',
    },
    '.MuiListItemIcon-root': {  // for menus
      minWidth: '30px'
    },
    '.MuiButton-endIcon': {
      marginLeft: 0
    },
    '.MuiMenuItem-root': {
      minWidth: '18em'
    },
    '.menuItemBlankIcon': {
      minWidth: '30px'
    },
    '.dateRange': {
      paddingLeft: '.8em',
      paddingRight: '.8em',
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center'
    }
  },
})(() => null);
