import React, { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { PERIOD_IDS, PERIOD_LABELS } from "../../modelviews/daterange";
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
        style={{textTransform: 'none', paddingRight: '4px'}}
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon/>}>
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

// https://stackoverflow.com/questions/49491569/disable-specific-days-in-material-ui-calendar-in-react
// function disableWeekends(date) {
//   return date.getDay() === 0 || date.getDay() === 6;
// }

// const DatePickerExampleDisableDates = () => (
//   <div>
//     <DatePicker hintText="Weekends Disabled" shouldDisableDate={disableWeekends} />
//     <DatePicker hintText="Random Dates Disabled" shouldDisableDate={disableRandomDates} />
//   </div>
// );

const DateRange = () => {

  return (
    <div className="dateRange" >
      <Typography component="span">2021-06-01</Typography>
      <DatePeriod />
      <IconButton color="inherit" style={{padding: 0}}><ChevronLeftIcon/></IconButton>
      <IconButton color="inherit" style={{padding: 0}}><ChevronRightIcon/></IconButton>
    </div>
  );
};

export default DateRange;