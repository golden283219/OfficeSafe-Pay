import React from "react";
import PropTypes from "prop-types";
import { Icon } from "../../atoms/Icon/Icon";
import { Wrapper } from "./BackButton.css";
import BackButtonIcon from "../../../assets/images/icon-back.svg";

function BackButton({ children, onClick }) {
  return (
    <Wrapper
      onClick={onClick}
      style={{
        display: "flex",
        marginTop: "2rem",
        fontSize: "1.5rem",
        alignItems: "center",
      }}
    >
      <Icon width={1.781} height={1.583} src={BackButtonIcon} />
      {children}
    </Wrapper>
  );
}

BackButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

export { BackButton };
