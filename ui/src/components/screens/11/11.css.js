import styled from "styled-components";

const Wrapper = styled.div`
  min-width: 37.188rem;
  overflow-y: auto;

  h2 {
    margin-top: 2.688rem;
  }

  .form-error {
    margin-top: 1.063rem;
    margin-bottom: 1.063rem;
  }

  button,
  .amount-field {
    width: 17.813rem;
  }

  textarea {
    background: rgba(196, 196, 196, 0.14);
    min-height: 15rem;
    width: 100%;
    font-size: 0.875rem;
    font-weight: 700;
    font-style: italic;
    color: #878787;
    padding: 1.375rem;
  }

  textarea::placeholder {
    font-weight: 700;
    font-style: italic;
    color: #878787;
  }

  .success {
    text-align: center;
    padding-top: 6.25rem;
    padding-bottom: 6.25rem;
  }
`;

export { Wrapper };
