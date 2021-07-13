import { Box } from "@material-ui/core";
import DrCr from "../DrCr";

export type Props = {
  [k: string]: any;
};

const PL = (props: Props) => {
  // React.HTMLAttributes<HTMLDivElement>
  return (
    <div {...props}>
      <Box style={{display: 'inline', paddingRight: '1em', fontWeight: 'bold'}}>P/(L):</Box>
      <DrCr amt={1.10} asCr={true} style={{fontWeight: 'bold'}}/>
    </div>);
};

export default PL;