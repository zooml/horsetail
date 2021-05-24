import { Button, IconButton, Snackbar } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import CloseIcon from '@material-ui/icons/Close';
import * as alert from '../modelviews/alert';

const Alerter = () => {
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState<alert.Alert>({message: ''});
  const showing = useRef(false);
  const show = (vis: boolean) => { // call here instead of setOpen
    if (vis) showing.current = true;
    setOpen(vis);
  };
  // define as ref to eliminate dep warning in useEffect
  const popNext = useRef(() => {
    if (showing.current) {console.log('already open'); return;}
    const p = alert.pop();
    if (p) {
      setPost(p);
      show(true); // TODO use setTimeout???
    } else {
      show(false);
    }
  }).current;
  useEffect(() => {
    const sub = alert.get$().subscribe({next: () => popNext()});
    return () => sub.unsubscribe();
  }, [popNext]);
  const onExit = () => {
    showing.current = false;
    popNext();
  }
  const onAction = () => {
    post.action?.onClick();
    show(false);
    popNext();
  };
  const onClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    show(false);
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      onExited={onExit}
      key={post.message}
      message={post.message}
      action={
        <React.Fragment>
          { post.action &&
            <Button color="secondary" size="small" onClick={onAction}>
              {post.action.label}
            </Button>
          }
          <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  );
};

export default Alerter;