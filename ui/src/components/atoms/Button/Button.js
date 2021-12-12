import React from "react";
import PropTypes from "prop-types";
import { Btn } from "./Button.css";

function Button({ variant, onClick, children, tabIndex, extendCSS }) {
  return (
    <Btn
      onClick={onClick}
      variant={variant}
      tabIndex={tabIndex}
      extendCSS={extendCSS}
    >
      {children}
    </Btn>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(["fixed", "default", "disabled-error", "inline"]),
  onClick: PropTypes.func,
  children: PropTypes.node,
  tabIndex: PropTypes.number,
  extendCSS: PropTypes.object,
};

Button.defaultProps = {
  variant: "default",
};

export { Button };
