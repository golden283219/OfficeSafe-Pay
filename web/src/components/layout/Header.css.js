import styled from "styled-components";
import logo from "../../assets/images/logo.png";
import logoPCIHIPAA from "../../assets/images/logopcihipaa.png";

const Wrapper = styled.div`
  height: 82px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 30%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  position: fixed;
  width: 100%;
  background: white;
`;

const Logo = styled.div`
  width: 217px;
  height: 48px;
  background: url(${logo}) center center;
  background-size: 217px 48px;
  margin-left: 49.5px;
  margin-top: 3.5px;
`;

const LogoPCIHIPAA = styled.div`
  display: none;
  width: 145px;
  height: 32px;
  background: url(${logoPCIHIPAA});
  background-size: 145px 32px;
  margin-right: 86.5px;
  margin-top: -2px;
  @media only screen and (min-width: 768px) {
    display: block;
  }
`;

const Burger = styled.button`
  background: none;
  border: none;
  padding: 0px;
  margin-right: 54px;
  &:hover {
    cursor: pointer;
  }
  @media only screen and (min-width: 768px) {
    display: none;
  }
`;

const BurgerSlice = styled.span`
  background-color: rgba(0, 0, 0, 0.5);
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 1px;
  & + span {
    margin-top: 4px;
  }
`;

const MobileNavWrapper = styled.div`
  top: 82px;
  position: fixed;
  width: 100%;
  background: white;
  z-index: 2;
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
  padding-left: 60px;
  padding-right: 60px;
  padding-top: 5px;
  @media only screen and (min-width: 768px) {
    display: none;
  }
`;

const MobileNavList = styled.ul`
  list-style: none;
  padding: 0px;
  margin: 0px;
`;

const MobileNavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    padding-left: 68px;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-left: -60px;
    color: #435e73;
    text-decoration: none;
    font-size: 13px;
    word-break: break-word;
  }
`;

const MobileLogoPCIHIPAA = styled.div`
  width: 120px;
  height: 27px;
  background: url(${logoPCIHIPAA});
  background-size: 120px 27px;
  margin-bottom: 10px;
`;

export {
  Wrapper,
  Logo,
  LogoPCIHIPAA,
  Burger,
  BurgerSlice,
  MobileNavWrapper,
  MobileNavList,
  MobileNavItem,
  MobileLogoPCIHIPAA,
};
