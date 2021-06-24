import React from "react";
import { Box } from "@material-ui/core";
import DrCr from "./DrCr";

export type Props = {
  [k: string]: any;
};

const PL = (props: Props) => {
  // React.HTMLAttributes<HTMLDivElement>
  return (
    <div {...props} >
      <Box style={{display: 'inline', paddingRight: '1em'}}>P/(L):</Box>
      <DrCr amt={1.10} asCr={true}></DrCr>
    </div>);
};

export default PL;