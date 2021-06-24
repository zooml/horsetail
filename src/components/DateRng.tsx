import React, { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { PERIOD_IDS, PERIOD_LABELS } from "../models/daterng";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const DatePeriod = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(PERIOD_IDS.MONTH);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelectClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };
  return (
    <div style={{display: 'inline'}}>
      <Button
        aria-haspopup="true"
        aria-controls="date-period-menu"
        aria-label="date-period"
        color="inherit"
        style={{textTransform: 'none'}}
        onClick={handleClick}
        startIcon={<ArrowDropDownIcon/>}>
        {PERIOD_LABELS[selectedIndex]}</Button>
      <Menu
        id="date-period-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        {PERIOD_LABELS.map((option, index) => (
          <MenuItem
            key={option}
            disabled={index === selectedIndex}
            selected={index === selectedIndex}
            onClick={(event) => handleSelectClick(event, index)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

const DateRng = () => {

  // TODO diplaying like 'block'!?!?!
  return (
    <div className="dateRng">
      <IconButton color="inherit" style={{padding: 0}}><ChevronLeftIcon/></IconButton>
      <Typography component="span">2021-06-01</Typography>
      <DatePeriod />
      <IconButton color="inherit" style={{padding: 0}}><ChevronRightIcon/></IconButton>
    </div>
  );
};

export default DateRng;