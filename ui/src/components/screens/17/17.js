import React, { useState } from "react";
import {
  goBack,
  goToHome,
  goToScreen,
  panMask,
  usePreservableState,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper, EntryInfo, Grid } from "./17.css";
import { Button } from "../../atoms/Button/Button";
import { Error } from "../../atoms/Error/Error";
import { selectGlobal } from "../../../store/global";
import { useSelector } from "react-redux";
import moment from "moment";
import ServerApi from "../../../ServerApi";

function Screen17() {
  const global = useSelector(selectGlobal);
  const [plan] = usePreservableState("plan", {
    plan: global?.statePayload?.plan || null,
  });
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });
  const [uiFreezed, setFreeze] = useState(false);
  const [formHasError, setFormHasError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    message: "",
  });

  if (!plan || !plan.patient_name) {
    goToHome();
    return null;
  }

  console.log(plan);

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goBack} />
        <Title>View Recurring Payment Plan</Title>
        <Grid>
          <div>
            <Title variant="h2">Patient</Title>
            <EntryInfo>{plan.patient_name}</EntryInfo>
          </div>
          <div style={{ marginLeft: "3.5rem", marginRight: "3.5rem" }}>
            <Title variant="h2">Charge amount</Title>
            <EntryInfo>${plan.amount}</EntryInfo>
          </div>
          <div>
            <Title variant="h2">Number of charges</Title>
            <EntryInfo>{plan.charge_number}</EntryInfo>
          </div>
          <div>
            <Title variant="h2">Card info</Title>
            <EntryInfo>{panMask(plan.card_token, plan.card_exp)}</EntryInfo>
          </div>
          <div style={{ marginLeft: "3.5rem", marginRight: "3.5rem" }}>
            <Title variant="h2">Date</Title>
            <EntryInfo>{moment(plan.created).format("llll")}</EntryInfo>
          </div>
          <div>
            <Title variant="h2">Total plan amount</Title>
            <EntryInfo>${plan.total_amount}</EntryInfo>
          </div>
        </Grid>
        <Error visibility={formHasError} extendClass="form-error">
          {formErrors.message ? formErrors.message : `Something went wrong`}
        </Error>
        <Button
          onClick={() => {
            if (uiFreezed) return;
            setFreeze(true);
            console.log("Delete", plan.id, plan.transaction_id);
            ServerApi.request({
              path: "cancel_plan",
              method: "POST",
              payload: {
                plan_id: plan.id,
                transaction_id: plan.transaction_id,
              },
            }).then(
              (data) => {
                if (data.status) {
                  goToScreen(16, { patient });
                } else {
                  console.log(data);
                  setFormHasError(true);
                  setFormErrors({ message: data.message });
                }
              },
              (error) => {
                setFreeze(false);
                setFormHasError(true);
                setFormErrors(error);
              }
            );
          }}
          extendCSS={{ marginTop: "4.375rem" }}
          variant={"inline"}
        >
          {uiFreezed ? "Cancelling..." : "Cancel"}
        </Button>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen17 };
