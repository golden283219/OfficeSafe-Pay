import React from "react";
import { goBack, goToScreen, usePreservableState } from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./13.css";
import { Name, Status } from "../../organisms/DataTable/DataTable.css";
import Moment from "moment";
import { Button } from "../../atoms/Button/Button";
import { useSelector } from "react-redux";
import { selectGlobal } from "../../../store/global";
import { DataTable } from "../../organisms/DataTable/DataTable";
import { useDataTable } from "../../../hooks/useDataTable";

function Screen13() {
  const global = useSelector(selectGlobal);
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });

  const { data, form, formOnChange } = useDataTable({
    source: {
      path: "tx",
      payload:
        patient && patient.id
          ? {
              patient_id: patient.id,
            }
          : null,
    },
  });

  const refundVariants = {
    linkedRefund: "Refund",
    void: "Refund",
    authRelease: "Release",
  };

  const transactionLabels = {
    sale: "Sale",
    linkedRefund: "Refund",
    auth: "Pre-Auth",
    authRelease: "Auth Release",
    void: "Void",
  };

  const nameView = (entry) => (
    <Name>{entry.patient_name || "- simple sale -"}</Name>
  );

  const actionView = (tx) => {
    if (!tx.approved) {
      return <Status type="failed">Failed</Status>;
    }

    if (typeof refundVariants[tx.refund_method] !== "undefined") {
      return (
        <Button
          variant={"inline"}
          onClick={() => {
            goToScreen(14, { tx, patient }, { patient });
          }}
        >
          {refundVariants[tx.refund_method]}
        </Button>
      );
    }

    if (tx.refund_method === "refunded") {
      return <Status>Refunded</Status>;
    } else if (tx.refund_method === "released") {
      return <Status>Released</Status>;
    }

    return <Status>Completed</Status>;
  };

  const typeLabel = (tx) => {
    let label = transactionLabels[tx.type] || tx.type;
    if (!tx.approved) {
      label = "Failed " + label;
    }
    return label;
  };

  /*     patient.id
                ? patient.first_name + " " + patient.last_name
                : "All transactions"
                */
  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper style={{ padding: "0 5vw" }}>
        <BackButton onClick={goBack} />
        <Title>Transactions</Title>

        <DataTable
          data={data}
          form={form}
          formOnChange={formOnChange}
          cols={[
            {
              name: "Customer",
              processor: (entry) => nameView(entry),
            },
            {
              name: "Amount",
              processor: (entry) => `$${entry.amount.toFixed(2)}`,
            },
            {
              name: "Date",
              processor: (entry) => Moment(entry.created).format("llll"),
            },
            {
              name: "Action",
              processor: (entry) => actionView(entry),
            },
            {
              name: "Type",
              processor: (entry) => typeLabel(entry),
            },
          ]}
        />
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}

export { Screen13 };
