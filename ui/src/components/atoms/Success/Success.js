import React from "react";
import PropTypes from "prop-types";
import { Wrapper } from "./Success.css";

function Success({ fontSize, fontWeight, children, extendClass, extendCSS }) {
  return (
    <Wrapper
      fontSize={fontSize}
      fontWeight={fontWeight}
      extendClass={extendClass}
      extendCSS={extendCSS}
    >
      {children}
    </Wrapper>
  );
}

Success.propTypes = {
  fontSize: PropTypes.number,
  fontWeight: PropTypes.number,
  children: PropTypes.node,
  extendClass: PropTypes.string,
  extendCSS: PropTypes.string,
};

Success.defaultProps = {
  fontSize: 2,
  fontWeight: 700,
  extendClass: "",
  extendCSS: "",
};

export { Success };
