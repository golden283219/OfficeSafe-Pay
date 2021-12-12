import styled from "styled-components";

const Wrapper = styled.footer`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px;
  margin-bottom: 15px;
  font-size: 13px;
  text-align: center;
`;

const Link = styled.a`
  color: #435e73;
  text-decoration: none;
  &:hover,
  &:focus {
    color: #273643;
    text-decoration: underline;
  }
`;

export { Wrapper, Link };
