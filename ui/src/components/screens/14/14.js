import React from "react";
import {
  formatAmount,
  goBack,
  goToScreen,
  panMask,
  usePreservableState,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { Textbox } from "../../molecules/Textbox/Textbox";
import { Button } from "../../atoms/Button/Button";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { PatientInfo, Wrapper } from "../10/10.css";
import Moment from "moment";

function Screen14() {
  const [tx] = usePreservableState("tx", {});
  const [patient] = usePreservableState("patient", {});
  const [form, setForm] = usePreservableState("form", {
    amount: formatAmount(tx.amount, "input"),
    isVoid: tx.refund_method !== "linkedRefund",
  });

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const makeRefund = () => {
    goToScreen(8, {
      type: "refund",
      tx,
      patient,
      skipHistory: true,
    });
  };

  const submit = (event) => {
    event.preventDefault();
    makeRefund();
  };

  const patientInfo = () => {
    if (patient && patient.card_token) {
      return (
        <>
          <Title variant="h2">Client name</Title>
          <PatientInfo>
            {patient.first_name + " " + patient.last_name}
          </PatientInfo>
          <Title variant="h2">Card info</Title>
          <PatientInfo>
            {panMask(patient.card_token, patient.card_exp)}
          </PatientInfo>
        </>
      );
    } else if (tx.patient_name) {
      return (
        <>
          <Title variant="h2">Client name</Title>
          <PatientInfo>{tx.patient_name}</PatientInfo>
        </>
      );
    }

    return null;
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goBack} />
        <Title>{form.isVoid ? "Void Transaction" : "Refund"}</Title>
        {tx ? (
          <form onSubmit={submit}>
            {patientInfo()}
            <Title variant="h2">Original amount</Title>
            <PatientInfo>{formatAmount(tx.amount)}</PatientInfo>
            <Title variant="h2">Original date</Title>
            <PatientInfo>{Moment(tx.created).format("llll")}</PatientInfo>

            <Textbox
              disabled={form.isVoid}
              label="Amount to refund"
              floatLabel={true}
              name="amount"
              value={form.amount}
              onChange={formOnChange}
              onBlur={formOnChange}
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

export { Screen14 };
