import React from "react";
import { goBack, goToScreen, usePreservableState } from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./16.css";
import { Name, Status } from "../../organisms/DataTable/DataTable.css";
import Moment from "moment";
import { Button } from "../../atoms/Button/Button";
import { DataTable } from "../../organisms/DataTable/DataTable";
import { useDataTable } from "../../../hooks/useDataTable";

function Screen16() {
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });
  const { data, form, formOnChange } = useDataTable({
    source: {
      path: "get_plans",
      payload:
        patient && patient.id
          ? {
              patient_id: patient.id,
            }
          : null,
    },
  });

  // {
  //   id: 2,
  //   patient_id: 1,
  //   first_name: "Viktors",
  //   last_name: "Žuks",
  //   created: moment(),
  //   card_token: "4444444444444444",
  //   card_exp: "1021",
  //   charges: 3,
  //   amount: 1000,
  //   last_transaction_status: "ok",
  // },
  const nameView = (entry) => <Name>{`${entry.patient_name}`}</Name>;
  const lastTransactionStatusView = (entry) => {
    const status = entry.last_transaction_status;
    if (status === "ok") {
      return <Status>OK</Status>;
    } else {
      return <Status type="failed">Failed</Status>;
    }
  };

  const actionView = (entry) => {
    return (
      <Button
        variant={"inline"}
        onClick={() => {
          goToScreen(17, { plan: entry, patient: patient });
        }}
      >
        View
      </Button>
    );
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper style={{ padding: "0 5vw" }}>
        <BackButton onClick={goBack} />
        <Title>Recurring Plans</Title>
        {patient.patient.id != 0 ? (
          <Button
            variant="fixed"
            onClick={() => {
              goToScreen(20, { patient });
            }}
          >
            Add Plan
          </Button>
        ) : (
          <></>
        )}

        <DataTable
          data={data}
          form={form}
          formOnChange={formOnChange}
          cols={[
            {
              name: "Patient",
              processor: (entry) => nameView(entry),
            },
            {
              name: "Charge Amount",
              processor: (entry) => `$${entry.amount}`,
            },
            {
              name: "Date",
              processor: (entry) => Moment(entry.created).format("llll"),
            },
            {
              name: "Last Transaction Status",
              processor: (entry) => lastTransactionStatusView(entry),
            },
            {
              name: "Action",
              processor: (entry) => actionView(entry),
            },
          ]}
        />
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen16 };
