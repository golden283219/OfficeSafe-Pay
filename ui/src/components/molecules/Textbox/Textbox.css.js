import styled, { css } from "styled-components";

const Wrapper = styled.div.attrs((props) => ({
  className: `
    ${props.extendClass && props.extendClass}
  `,
}))`
  width: 100%;
  ${(props) =>
    props.extendCSS &&
    css`
      ${props.extendCSS}
    `}
  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.6;
    `}
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 400;
  position: absolute;
  left: 0;
  margin-top: -3rem;

  :hover {
    cursor: text;
  }

  ${(props) =>
    props.float &&
    css`
      transition: 0.2s ease-in-out;
    `}
  ${(props) =>
    props.error &&
    css`
      color: #ff0000;
    `}
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 0.013rem solid #979797;
  &:hover {
    border-bottom-color: #090909;
  }
  padding-top: 2rem;
  padding-bottom: 0.25rem;
  position: relative;
  ${(props) =>
    props.iconOnTheRight &&
    css`
      flex-direction: row-reverse;
    `}
`;

const Input = styled.input`
  background-color: transparent;
  width: 100%;
  border: none;
  mix-blend-mode: normal;
  opacity: 0.7;
  font-size: 1rem;

  :focus {
    outline: none;
    border: none;
  }

  ${(props) =>
    props.float &&
    css`
      :focus + label {
        margin-top: -3rem;
      }

      :focus:placeholder-shown + label {
        margin-top: -3rem;
      }

      :placeholder-shown + label {
        margin-top: 0rem;
      }
    `}

  ::placeholder {
    mix-blend-mode: normal;
    font-size: 1rem;
  }
`;

export { Wrapper, Label, InputWrapper, Input };
