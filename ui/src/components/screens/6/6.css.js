import styled from "styled-components";

const Wrapper = styled.div``;

const TilesGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-column-gap: 1.25rem;
  margin-top: 0.75rem;
  > div:last-child > div div:nth-child(2) {
    width: 7.2rem;
  }
`;

export { Wrapper, TilesGrid };
