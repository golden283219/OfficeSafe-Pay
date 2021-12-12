import React from "react";
import PropTypes from "prop-types";
import { Icon, Label, LabelText, NativeCheckbox, StyledCheckbox } from "./Checkbox.css";

/**
 * Classic checkbox component
 * with `value` casted as string
 * and represents checked state: 'true'|'false'
 *
 * @param label
 * @param value
 * @param disabled
 * @param onChange
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function Checkbox(
  {
    label, value, disabled,
    onChange,
    ...props
  }
) {

  return (
    <Label>
      <NativeCheckbox
        defaultChecked={value==='true'}
        disabled={disabled}
        onChange={(e) => {
          e.target.value = e.target.checked;
          onChange ? onChange(e) : null;
        }}
        {...props}
      />
      <StyledCheckbox checked={value==='true'}>
        <Icon viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </Icon>
      </StyledCheckbox>
      <LabelText>{label}</LabelText>
    </Label>
  )
}

Checkbox.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
}

export { Checkbox }
