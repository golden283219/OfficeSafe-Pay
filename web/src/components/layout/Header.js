import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  Wrapper,
  Logo,
  LogoPCIHIPAA,
  Burger,
  BurgerSlice,
  MobileNavWrapper,
  MobileNavList,
  MobileNavItem,
  MobileLogoPCIHIPAA,
} from "./Header.css";

function Header() {
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  return (
    <React.Fragment>
      <Wrapper>
        <Logo />
        <LogoPCIHIPAA />
        <Burger
          onClick={() => {
            setMobileNavVisible(!mobileNavVisible);
          }}
        >
          <BurgerSlice />
          <BurgerSlice />
          <BurgerSlice />
        </Burger>
      </Wrapper>
      {mobileNavVisible && (
        <MobileNavWrapper>
          <MobileLogoPCIHIPAA />
          <MobileNavList>
            <MobileNavItem>
              <Link to="/">Test</Link>
            </MobileNavItem>
          </MobileNavList>
        </MobileNavWrapper>
      )}
    </React.Fragment>
  );
}

export { Header };
