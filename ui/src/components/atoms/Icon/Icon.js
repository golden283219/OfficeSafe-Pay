import React from "react";
import PropTypes from "prop-types";
import { Wrapper } from "./Icon.css";

function Icon({ width, height, src, extendClass, extendCSS }) {
  return (
    <Wrapper
      width={width}
      height={height}
      src={src}
      extendClass={extendClass}
      extendCSS={extendCSS}
    />
  );
}

Icon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  src: PropTypes.node,
  extendClass: PropTypes.string,
  extendCSS: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

Icon.defaultProps = { extendClass: "", extendCSS: "" };

export { Icon };
