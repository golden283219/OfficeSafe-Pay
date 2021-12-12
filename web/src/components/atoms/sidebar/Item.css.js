import styled, { css } from "styled-components";

const Wrapper = styled.li`
  margin-right: -20px;
  margin-left: -20px;
  .sidebar-link {
    display: flex;
    align-items: center;
    padding: 8px 20px;
    color: #435e73;
    text-decoration: none;
    font-size: 13px;
    word-break: break-word;
  }
  .sidebar-link:hover {
    background-color: #eee;
  }
`;

const Icon = styled.span`
  display: inline-block;
  ${(props) =>
    props.src &&
    css`
      background-image: url(${props.src});
      background-repeat: no-repeat;
    `}
  width: 19px;
  height: 19px;
  background-position: left center;
`;

export { Wrapper, Icon };
