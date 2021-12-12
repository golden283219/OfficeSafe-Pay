import React from "react";
import PropTypes from "prop-types";
import { Icon } from "../../atoms/Icon/Icon";
import { Wrapper, Label, InputWrapper, Input } from "./Textbox.css";

function Textbox({
  floatLabel,
  label,
  disabled,
  placeholder,
  name,
  value,
  type,
  onChange,
  onFocus,
  onInput,
  onBlur,
  error,
  icon,
  iconWidth,
  iconHeight,
  iconOnTheRight,
  iconExtendCSS,
  extendClass,
  extendCSS,
}) {
  return (
    <Wrapper extendClass={extendClass} extendCSS={extendCSS} disabled={disabled}>
      <InputWrapper iconOnTheRight={iconOnTheRight}>
        {icon && (
          <Icon
            width={iconWidth}
            height={iconHeight}
            src={icon}
            extendCSS={iconExtendCSS}
          />
        )}
        <Input
          float={floatLabel}
          id={"form_" + name}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={!floatLabel ? placeholder : " "}
          onChange={onChange}
          onFocus={onFocus}
          onInput={onInput}
          onBlur={onBlur}
          value={value}
        />
        {label && (
          <Label error={error} float={floatLabel} htmlFor={"form_" + name}>
            {label}
          </Label>
        )}
      </InputWrapper>
    </Wrapper>
  );
}

Textbox.propTypes = {
  floatLabel: PropTypes.bool,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onInput: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.bool,
  icon: PropTypes.node,
  iconWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  iconHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  iconOnTheRight: PropTypes.bool,
  iconExtendCSS: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  extendClass: PropTypes.string,
  extendCSS: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

Textbox.defaultProps = {
  floatLabel: false,
  name: "",
  type: "text",
  error: false,
  iconOnTheRight: false,
  iconExtendCSS: { paddingLeft: "0.125rem", paddingRight: "0.875rem" },
  extendClass: "",
  extendCSS: "",
};

export { Textbox };
