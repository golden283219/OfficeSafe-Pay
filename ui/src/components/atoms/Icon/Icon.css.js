import styled, { css } from "styled-components";

const Wrapper = styled.div.attrs((props) => ({
  className: `
      ${props.extendClass && props.extendClass}
    `,
}))`
  ${(props) =>
    props.extendCSS &&
    css`
      ${props.extendCSS}
    `}
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
  background-image: url(${(props) => props.src});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
`;

export { Wrapper };
