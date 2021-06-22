import { Container } from "@material-ui/core";
import React from "react";
import { Box } from "@material-ui/core"; // must be last import

const PubContent = (props: {[k: string]: any}) => {
  return (
    <Container {...props} className="pubContent">
      <Box>hi</Box>
    </Container>
  );
};

export default PubContent;