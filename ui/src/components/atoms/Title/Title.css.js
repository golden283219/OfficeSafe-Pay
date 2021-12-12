import styled, { css } from "styled-components";

const Wrapper = styled.div`
  h1 {
    font-size: ${(props) => props.fontSize}rem;
    font-weight: 700;
    color: ${(props) => (props.color ? props.color : "#070707")};
    ${(props) =>
      props.noMargin
        ? css`
            margin: 0;
          `
        : css`
            margin-top: 0.708rem;
            margin-bottom: 0.563rem;
          `}
  }

  h2 {
    font-size: 0.75rem;
    font-weight: 800;
    color: ${(props) => (props.color ? props.color : "#070707")};
  }
`;

export { Wrapper };
