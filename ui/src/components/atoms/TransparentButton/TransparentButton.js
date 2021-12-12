import React from "react";
import PropTypes from "prop-types";
import { Btn } from "./TransparentButton.css";

function TransparentButton({ onClick, children, extendClass }) {
  return (
    <Btn onClick={onClick} extendClass={extendClass}>
      {children}
    </Btn>
  );
}

TransparentButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  extendClass: PropTypes.string,
};

export { TransparentButton };
