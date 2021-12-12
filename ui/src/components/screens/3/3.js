import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/user";
import Moment from "moment";
import { goToScreen } from "../../../utils";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Tile } from "../../molecules/Tile/Tile";
import { Wrapper, DateText, TilesGrid } from "./3.css";
import { Title } from "../../atoms/Title/Title";
import AddPatientIcon from "../../../assets/images/icon-add-patient.svg";
import AcceptPaymentIcon from "../../../assets/images/icon-accept-payment.svg";
import SearchPatientIcon from "../../../assets/images/icon-search-purple.svg";
import RecurringPaymentIcon from "../../../assets/images/icon-recurring-payment.svg";

function Screen3() {
  const userName = useSelector(selectUser);
  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <DateText>{Moment().format("Do MMMM, YYYY")}</DateText>
        <Title fontSize={1.5} noMargin>
          Hello, {userName?.name}
        </Title>
        <TilesGrid>
          <Tile
            onClick={() => {
              goToScreen(4);
            }}
            color="255,234,233"
            iconWidth={2}
            iconHeight={2}
            iconSrc={AddPatientIcon}
            title="Add Patient"
            description="New patient"
          />
          <Tile
            onClick={() => {
              goToScreen(6);
            }}
            color="227,237,255"
            iconWidth={1.5}
            iconHeight={1.25}
            iconSrc={AcceptPaymentIcon}
            title="Accept Payment"
            description="Make a payment"
          />
          <Tile
            onClick={() => {
              goToScreen(5);
            }}
            color="237,228,255"
            iconWidth={1.125}
            iconHeight={1.125}
            iconSrc={SearchPatientIcon}
            title="Search Patient"
            description="Existing patients"
          />
          <Tile
            onClick={() => {
              goToScreen(16);
            }}
            color="227,255,239"
            iconWidth={1.5}
            iconHeight={1.167}
            iconSrc={RecurringPaymentIcon}
            title="Recurring Plans"
            description="Rec payment plans"
          />
        </TilesGrid>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen3 };
