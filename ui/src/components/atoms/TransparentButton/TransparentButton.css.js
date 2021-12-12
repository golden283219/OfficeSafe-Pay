import styled from "styled-components";

const Btn = styled.button.attrs((props) => ({
  className: `
      ${props.extendClass && props.extendClass}
    `,
}))`
  color: #0b69ff;
  font-size: 0.75rem;
  font-weight: 500;
  border: 0.038rem solid #0b69ff;
  padding-top: 0.813rem;
  padding-bottom: 0.813rem;
  padding-left: 1.063rem;
  padding-right: 1.063rem;
`;

export { Btn };
