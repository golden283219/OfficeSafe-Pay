import styled, { css } from "styled-components";

const Wrapper = styled.div`
  margin-top: 1.313rem;
  padding-left: 1.688rem;
  padding-right: 2rem;
  padding-top: 1.375rem;
  padding-bottom: 1.375rem;
  position: relative;
  min-width: 43.75rem;
  :first-child {
    margin-top: 0rem;
  }
  ${(props) =>
    props.status == "error" &&
    css`
      background-color: #ffe0e0;
    `};
`;

const Message = styled.div`
  color: #000000;
  font-size: 1.313rem;
`;

const CancelWrapper = styled.div`
  position: absolute;
  top: 1.1rem;
  right: 0rem;
`;

export { Wrapper, Message, CancelWrapper };
