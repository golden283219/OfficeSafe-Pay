import styled from "styled-components";

const Label = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.75rem;
`

const LabelText = styled.span`
  margin-left: 0.5rem;
`

const NativeCheckbox = styled.input.attrs({type: 'checkbox'})`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #979797;
  background: ${props => props.checked ? '#0b69ff' : 'transparent'};
  border-radius: 30%;

  ${NativeCheckbox}:focus + & {
    border-color: #090909;
  }

  ${Icon} {
    visibility: ${props => props.checked ? 'visible' : 'hidden'};
  }
`

export { Label, LabelText, NativeCheckbox, StyledCheckbox, Icon }
