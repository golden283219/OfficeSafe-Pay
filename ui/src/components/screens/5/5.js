import React, { useState, useEffect } from "react";
import { goToHome, goToScreen } from "../../../utils";
import { selectGlobal } from "../../../store/global";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Success } from "../../atoms/Success/Success";
import { TransparentButton } from "../../atoms/TransparentButton/TransparentButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./5.css";
import { Button } from "../../atoms/Button/Button";
import { useSelector } from "react-redux";
import { DataTable } from "../../organisms/DataTable/DataTable";
import { useDataTable } from "../../../hooks/useDataTable";

/**
 * Search patient
 *
 * Shows patients list
 * Screen variants:
 * - default: just show list
 * - checkout: pick patient for payment
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen5() {
  const global = useSelector(selectGlobal);
  const variant = global?.statePayload?.variant || "defaut"; //TODO use selector
  const message = global?.statePayload?.message?.success; //TODO use selector
  const added_patient = global?.statePayload?.patient; //TODO use selector

  const { data, form, formOnChange } = useDataTable({
    source: {
      path: "patients",
      payload: {},
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (message) setShowSuccess(true);
    if (added_patient) console.log("added patient:", added_patient);
  }, []);

  const entryOnChoose = (patient) => {
    console.log(patient);
    if (variant === "checkout") {
      goToScreen(10, { patient }, { form }); // TODO what form is for?
    } else {
      goToScreen(12, { patient });
    }
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton onClick={goToHome} />
        {showSuccess ? (
          <>
            <Success extendClass="success">{message}</Success>
            <TransparentButton
              extendClass="mr-20"
              onClick={() => {
                goToScreen(12, { patient: added_patient });
              }}
            >
              View Profile
            </TransparentButton>
            <TransparentButton
              onClick={() => {
                goToScreen(4);
              }}
            >
              + Add Patient
            </TransparentButton>
          </>
        ) : (
          <Title>
            {variant === "checkout"
              ? "Select Existing Patient"
              : "Search Patient"}
          </Title>
        )}
        <DataTable
          data={data}
          form={form}
          formOnChange={formOnChange}
          entryOnChoose={entryOnChoose}
        />
      </Wrapper>
      <div style={{ marginTop: "2rem" }}>
        <Button
          onClick={() => {
            goToScreen(13);
          }}
          variant={"inline"}
        >
          View Previous Transactions
        </Button>
      </div>
      <BottomNavBar />
    </div>
  );
}

export { Screen5 };
