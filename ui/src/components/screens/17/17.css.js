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

const EntryInfo = styled.div`
  font-size: 1rem;
  font-weight: 400;
  margin-top: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-column-gap: 3.5rem;
  grid-row-gap: 2.688rem;
  margin-top: 2.75rem;
`;

export { Wrapper, EntryInfo, Grid };
