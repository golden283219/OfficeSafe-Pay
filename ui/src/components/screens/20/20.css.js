import styled from "styled-components";

const Wrapper = styled.div`
  min-width: 37.188rem;
  overflow-y: auto;

  .form-error {
    margin-top: 1.063rem;
    margin-bottom: 1.063rem;
  }

  button {
    width: 17.813rem;
  }
`;

const PatientInfo = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 1.563rem;
  margin-bottom: 2.188rem;
`;

const BillingInfo = styled.div`
  display: grid;
  grid-template-columns: 17.813rem 17.813rem;
  grid-column-gap: 1.563rem;
  & > div:last-child {
    width: 17.813rem;
  }
`;

export { Wrapper, PatientInfo, BillingInfo };
