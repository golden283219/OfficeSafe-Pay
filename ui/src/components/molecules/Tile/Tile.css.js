import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  background-color: rgb(${(props) => props.background});
  padding: 1.875rem 1.625rem;
  transition: all linear 70ms;
  box-shadow: 0rem 1rem 1.875rem rgba(18, 62, 119, 0.03);
  &:hover {
    cursor: pointer;
    transform: rotate3d(0, 1, 1, 7deg) scale(1.1);
  }
  &:first-child:hover {
    transform: rotate3d(0, 1, 1, -7deg) scale(1.1);
  }
`;

const SubWrapper = styled.div`
  width: 6.25rem;
`;

const IconWrapper = styled.div`
  height: 2rem;
  display: flex;
  align-items: center;
`;

const TitleText = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: #37393d;
  width: 4.688rem;
`;

const DescriptionText = styled.div`
  margin-top: 0.875rem;
  font-size: 0.75rem;
  font-weight: 400;
`;

export { Wrapper, SubWrapper, IconWrapper, TitleText, DescriptionText };
