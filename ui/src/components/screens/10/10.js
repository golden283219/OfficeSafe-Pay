import React, { useEffect } from "react";
import {
  goBack,
  goToScreen,
  panMask,
  // sequence,
  usePreservableState,
  followNavResult,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { Textbox } from "../../molecules/Textbox/Textbox";
import { Button } from "../../atoms/Button/Button";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper, PatientInfo } from "./10.css";
// import Processor from "../../../Processor";
// import WinAutomate from "../../../WinAutomate";
import { useSelector } from "react-redux";
import { selectGlobal } from "../../../store/global";

function Screen10() {
  const global = useSelector(selectGlobal);
  const [form, setForm] = usePreservableState("form", {
    amount: "10,00",
  });

  followNavResult((result) => {
    if (result.success) {
      goBack();
    }
  });

  const [patient, setPatient] = usePreservableState("patient", {});

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  useEffect(() => {
    setPatient(global?.statePayload?.patient);
  }, []);

  async function makePayment() {
    // // dx automation
    // if (patient) {
    //   await WinAutomate.searchPatient(patient.last_name, patient.first_name);
    // } else {
    //   await WinAutomate.confirmCurrentPatient();
    // }

    // // processor
    // const [amount, type] = Processor.prepareAmount(form.amount);

    goToScreen(8, {
      patient: patient,
      amount: form.amount,
      skipHistory: true,
    });
  }

  const submit = (event) => {
    event.preventDefault();
    makePayment();
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goBack} />
        <Title>Accept Payment</Title>
        {patient && patient.card_token ? (
          <form onSubmit={submit}>
            <Title variant="h2">Client info</Title>
            <PatientInfo>
              {patient.first_name + " " + patient.last_name}
            </PatientInfo>
            <Title variant="h2">Card info</Title>
            <PatientInfo>
              {panMask(patient.card_token) + ", till " + patient.card_exp}
            </PatientInfo>
            <Textbox
              label="Amount"
              floatLabel={true}
              name="amount"
              value={form.amount}
              onChange={formOnChange}
              extendClass="amount-field"
            />
            <Button>Process</Button>
          </form>
        ) : null}
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen10 };
