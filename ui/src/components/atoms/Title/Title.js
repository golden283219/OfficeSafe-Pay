import React from "react";
import PropTypes from "prop-types";
import { Wrapper } from "./Title.css";

function Title({ children, variant, fontSize, noMargin, color }) {
  return (
    <Wrapper fontSize={fontSize} noMargin={noMargin} color={color}>
      {variant === "h1" && <h1>{children}</h1>}
      {variant === "h2" && <h2>{children}</h2>}
    </Wrapper>
  );
}

Title.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(["h1", "h2"]),
  fontSize: PropTypes.number,
  noMargin: PropTypes.bool,
  color: PropTypes.string,
};

Title.defaultProps = {
  variant: "h1",
  fontSize: 2,
  noMargin: false,
};

export { Title };
