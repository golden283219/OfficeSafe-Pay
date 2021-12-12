import styled from "styled-components";

const Wrapper = styled.div`
  h1 {
    margin-top: 0.625rem;
  }

  .amount-field {
    margin-top: -1.2rem;
  }

  .amount-field > div {
    border: none;
  }

  .forward-big-icon {
    position: absolute;
    top: 37px;
    right: -106px;
  }

  input,
  input::placeholder {
    color: #37393d;
  }
`;

const Card = styled.div`
  width: 18.75rem;
  height: 11.5rem;
  background-color: rgba(11, 105, 255, 0.1);
  box-shadow: 0rem 1rem 1.875rem rgba(18, 62, 119, 0.03);
  border-radius: 0.313rem;
  padding-top: 1.625rem;
  padding-bottom: 1.625rem;
  padding-left: 1.813rem;
  padding-right: 1.813rem;
  position: relative;
`;

const Bacon = styled.div`
  margin-top: 1.375rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.438rem;
  padding-right: 0.438rem;
  background-color: rgba(11, 105, 255, 0.12);
  color: #0b69ff;
  font-size: 0.625rem;
  font-weight: 500;
  display: inline-block;
`;

export { Wrapper, Card, Bacon };
