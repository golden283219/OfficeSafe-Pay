import React from "react";
import PropTypes from "prop-types";
import { Wrapper } from "./Error.css";

function Error({
  visibility,
  fontSize,
  fontWeight,
  children,
  extendClass,
  extendCSS,
}) {
  if (visibility) {
    visibility = "visible";
  } else {
    visibility = "hidden";
  }

  return (
    <Wrapper
      visibility={visibility}
      fontSize={fontSize}
      fontWeight={fontWeight}
      extendClass={extendClass}
      extendCSS={extendCSS}
    >
      {children}
    </Wrapper>
  );
}

Error.propTypes = {
  visibility: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  fontSize: PropTypes.number,
  fontWeight: PropTypes.number,
  children: PropTypes.node,
  extendClass: PropTypes.string,
  extendCSS: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

Error.defaultProps = {
  fontSize: 0.875,
  fontWeight: 700,
  visibility: false,
  extendCSS: "",
};

export { Error };
