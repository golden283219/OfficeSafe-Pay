import styled from "styled-components";

const Wrapper = styled.div`
  h2 {
    margin-top: 1rem;
  }

  .form-error {
    margin-top: 1.063rem;
    margin-bottom: 1.063rem;
  }

  button,
  .amount-field {
    width: 17.813rem;
  }

  .amount-field {
    margin-top: 0.7rem;
  }
`;

const PatientInfo = styled.div`
  font-size: 1rem;
  font-weight: 400;
  margin-top: 0.5rem;
`;

const ButtonsBar = styled.div`
  display: flex;
  margin-top: 2rem;
  width: calc(100% + 2.5rem);
  justify-content: space-between;
`;

export { Wrapper, PatientInfo, ButtonsBar };
