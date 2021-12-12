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
import { Wrapper, PatientInfo, ButtonsBar } from "./12.css";
import { Button } from "../../atoms/Button/Button";
import { selectGlobal } from "../../../store/global";
import { useSelector } from "react-redux";
import { Error } from "../../atoms/Error/Error";
import ServerApi from "../../../ServerApi";

function Screen12() {
  const [uiFreezed, setFreeze] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorVisiblity, setErrorVisiblity] = useState(false);
  const global = useSelector(selectGlobal);
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || null,
  });

  if (!patient || !patient.first_name) {
    goToHome();
    return null;
  }

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goBack} />
        <Title>View Patient</Title>
        <Title variant="h2">Client info</Title>
        <PatientInfo>
          {patient.first_name + " " + patient.last_name}
        </PatientInfo>
        <Title variant="h2">Card info</Title>
        <PatientInfo>
          {panMask(patient.card_token, patient.card_exp)}
        </PatientInfo>
        <ButtonsBar>
          <Button
            onClick={() => {
              if (uiFreezed) return;
              goToScreen(13, { patient });
            }}
            variant={"inline"}
          >
            View Transactions
          </Button>
          <Button
            onClick={() => {
              if (uiFreezed) return;
              goToScreen(16, { patient });
            }}
            variant={"inline"}
          >
            Recurring Plans
          </Button>
          <Button
            onClick={() => {
              if (uiFreezed) return;
              goToScreen(18, { patient });
            }}
            variant={"inline"}
          >
            View Cards
          </Button>
          <Button
            onClick={() => {
              console.log({
                patient_id: patient.id,
                customer_vault_id: patient.customer_vault_id,
              });
              if (uiFreezed) return;
              setFreeze(true);
              ServerApi.request({
                path: "delete_patient",
                method: "POST",
                payload: {
                  patient_id: patient.id,
                  customer_vault_id: patient.customer_vault_id,
                },
              }).then(
                (data) => {
                  if (data.status) {
                    // go to patient list and do not add this screen to history
                    goToScreen(5, {
                      // message: { success: "Patient Successfully removed" },
                      skipHistory: true,
                    });
                  } else {
                    setFreeze(false);
                    setErrorMsg(data.message);
                    setErrorVisiblity(true);
                  }
                },
                (message) => {
                  setFreeze(false);
                  setErrorMsg(message);
                  setErrorVisiblity(true);
                }
              );
              // goToScreen(18, { patient });
            }}
            variant={"inline"}
          >
            {uiFreezed ? "Deleting..." : "Delete"}
          </Button>
        </ButtonsBar>
        <Error visibility={errorVisiblity} extendClass="form-error">
          {errorMsg}
        </Error>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen12 };
