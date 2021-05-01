import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FixedSizeList, ListChildComponentProps, areEqual } from 'react-window';

// TODO delete file

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: 400,
      maxWidth: 300,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const Row = React.memo((props: ListChildComponentProps) => {
  const { index, style } = props;
  useEffect(() => console.log(`render ${index}`));
  const ref = React.useRef<HTMLElement>();
  if (index === 4) {
    setTimeout(() => {
      const span = ref?.current?.firstChild;
      if (span) span.textContent = 'hi';
    }, 3000);
  }
  return (
    <ListItem button style={style} key={index}>
      <ListItemText primary={`Item ${index + 1}`} ref={ref} />
    </ListItem>
  );
}, areEqual);

export default function VirtualizedList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <FixedSizeList height={400} width={300} itemSize={46} itemCount={200}>
        {Row}
      </FixedSizeList>
    </div>
  );
}
