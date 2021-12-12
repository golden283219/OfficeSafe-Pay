import React from "react";
import PropTypes from "prop-types";
import { Icon } from "../../atoms/Icon/Icon";
import CancelIcon from "../../../assets/images/icon-cancel.svg";
import { Wrapper, Message, CancelWrapper } from "./Notification.css";

function Notification({ status, message, onClick, cancelOnClick }) {
  return (
    <Wrapper status={status}>
      <Message onClick={onClick}>{message}</Message>
      <CancelWrapper onClick={cancelOnClick}>
        <Icon width={2.375} height={2.375} src={CancelIcon} />
      </CancelWrapper>
    </Wrapper>
  );
}

Notification.propTypes = {
  status: PropTypes.string,
  message: PropTypes.string,
  onClick: PropTypes.func,
  cancelOnClick: PropTypes.func,
};

export { Notification };
