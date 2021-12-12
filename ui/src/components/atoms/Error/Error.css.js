import styled, { css } from "styled-components";

const Wrapper = styled.div.attrs((props) => ({
  className: `
      ${props.extendClass && props.extendClass}
    `,
}))`
  width: 100%;
  color: #ff3939;
  font-size: ${(props) => props.fontSize}rem;
  font-weight: ${(props) => props.fontWeight};
  visibility: ${(props) => props.visibility};
  ${(props) =>
    props.extendCSS &&
    css`
      ${props.extendCSS}
    `};
`;

export { Wrapper };
