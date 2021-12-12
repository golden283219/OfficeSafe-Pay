import React, { useState, useEffect } from "react";
import { selectGlobal } from "../../../store/global";
import { Icon } from "../../atoms/Icon/Icon";
import LogoBlack from "../../../assets/images/logo-black.png";
import { Title } from "../../atoms/Title/Title";
import { Success } from "../../atoms/Success/Success";
import { Error } from "../../atoms/Error/Error";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./8.css";
import { goBack } from "../../../utils";
// import Processor from "../../../Processor";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { useSelector } from "react-redux";
import ServerApi from "../../../ServerApi";

/**
 * Payment processing screen
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen8() {
  const global = useSelector(selectGlobal);
  const [status, setStatus] = useState(null);
  const [terminalLog, setLog] = useState("");
  const [result, setResult] = useState(null);

  const added_patient = global?.statePayload?.patient;
  const amount = parseFloat(global?.statePayload?.amount).toFixed(2);
  const type = global?.statePayload?.type;
  const tx = global?.statePayload?.tx;

  useEffect(() => {
    if (type == "terminal" && amount) {
      ServerApi.request({
        path: "terminal_payment",
        method: "POST",
        payload: {
          type: "sale",
          amount: amount,
        },
      }).then(
        (data) => {
          console.log(data);
          if (data.status) {
            setStatus(true);
          } else {
            setStatus(data.message);
          }
        },
        (message) => {
          setStatus(message.message);
        }
      );
    } else if (type == "refund") {
      console.log(added_patient, tx);
      ServerApi.request({
        path: "refund_payment",
        method: "POST",
        payload: {
          transactionid: tx.tx_id,
        },
      }).then(
        (data) => {
          console.log(data);
          if (data.status) {
            setStatus(true);
          } else {
            setStatus(data.message);
          }
        },
        (message) => {
          setStatus(message.message);
        }
      );
    } else if (added_patient && amount) {
      setStatus(null);
      setLog("");
      setResult(null);

      ServerApi.request({
        path: "card_payment",
        method: "POST",
        payload: {
          patient_id: added_patient["id"],
          type: "sale",
          amount: amount,
          customer_vault_id: added_patient["customer_vault_id"],
          user_id: parseInt(added_patient.user_id),
        },
      }).then(
        (data) => {
          console.log(data);
          if (data.tx_id) {
            setStatus(true);
          } else {
            setStatus(data.message);
          }
        },
        (message) => {
          setStatus(message.message);
        }
      );
    }
  }, [added_patient, amount]);

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <Icon width={11.438} height={5} src={LogoBlack} />
        {status === null ? (
          <Title fontSize={1.5} noMargin>
            Processing...
          </Title>
        ) : status === true ? (
          <Success fontSize={1.5}>Payment successfully made</Success>
        ) : (
          <Error visibility={true} fontSize={1.5}>
            <p>Payment did not go through</p>
            <p>{status}</p>
          </Error>
        )}
        {status === null ? null : (
          <BackButton onClick={() => goBack(result)}>
            &nbsp; &nbsp; Back
          </BackButton>
        )}
        <pre
          style={{
            display: "none",
            width: "100%",
            marginTop: "6rem",
            fontSize: "0.7rem",
            textAlign: "left",
            overflow: "auto",
            whiteSpace: "break-spaces",
          }}
        >
          {terminalLog}
        </pre>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen8 };
