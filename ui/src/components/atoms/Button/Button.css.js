import styled, { css } from "styled-components";
import BtnArrow from "../../../assets/images/icon-forward.svg";
const Btn = styled.button`
  width: 100%;
  padding-left: 1.938rem;
  padding-top: 1.125rem;
  padding-bottom: 1.125rem;
  text-align: left;
  color: #ffffff;
  font-size: 0.875rem;
  ${(props) =>
    props.variant === "default" &&
    css`
      background-color: #0b69ff;
      background-image: url(${BtnArrow});
      background-repeat: no-repeat;
      background-position: calc(100% - 1.766rem) center;
    `}
  ${(props) =>
    props.variant === "inline" &&
    css`
      background-color: #0b69ff;
      background-image: none;
      padding: 0 1rem;
      width: auto !important;
      height: 2rem;
      line-height: 1rem;
      align-self: end;
      font-weight: 800;
    `}
    ${(props) =>
    props.variant === "fixed" &&
    css`
      position: absolute;
      width: auto !important;
      padding-left: 2.188rem;
      padding-right: 2.188rem;
      padding-top: 1rem;
      padding-bottom: 1rem;
      border: 0.125rem solid black;
      color: black;
      font-weight: 800;
      top: 47px;
      right: 65px;
    `}

  &:hover, &:focus {
    filter: saturate(0.5);
  }
  &:active {
    filter: hue-rotate(-20deg);
  }

  ${(props) =>
    props.extendCSS &&
    css`
      ${props.extendCSS}
    `};
`;

export { Btn };
