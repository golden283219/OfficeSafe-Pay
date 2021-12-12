import React from "react";
import { goToScreen } from "../../../utils";
import { Title } from "../../atoms/Title/Title";
import { Tile } from "../../molecules/Tile/Tile";
import { Wrapper, TilesGrid } from "./6.css";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import AddPatientIcon from "../../../assets/images/icon-add-patient.svg";
import AcceptPaymentIcon from "../../../assets/images/icon-accept-payment.svg";
import SearchPatientIcon from "../../../assets/images/icon-search-purple.svg";

function Screen6() {
  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <Title fontSize={1.5} noMargin>
          How would you like to accept payment?
        </Title>
        <TilesGrid>
          <Tile
            onClick={() => {
              goToScreen(7);
            }}
            color="255,234,233"
            iconWidth={2}
            iconHeight={2}
            iconSrc={AcceptPaymentIcon}
            title="Add New Card on File"
            description="Accept payment and create patient"
          />
          <Tile
            onClick={() => {
              goToScreen(9);
            }}
            color="227,237,255"
            iconWidth={1.5}
            iconHeight={1.25}
            iconSrc={AddPatientIcon}
            title="Card Present"
            description="Payment via Terminal"
          />
          <Tile
            onClick={() => {
              goToScreen(5, { variant: "checkout" });
            }}
            color="237,228,255"
            iconWidth={1.125}
            iconHeight={1.125}
            iconSrc={SearchPatientIcon}
            title="Pay With Card on File"
            description="Pay with preauthorized card"
          />
        </TilesGrid>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen6 };
