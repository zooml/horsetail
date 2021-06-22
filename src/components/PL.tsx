import React from "react";
import { Box } from "@material-ui/core";

export type Props = {
  [k: string]: any
};

const PL = (props: Props) => {

  return (
    <Box {...props}>P/L: $1.10</Box>
  );
};

export default PL;