//View Card page

import React from "react";
import {
  goBack,
  goToHome,
  goToScreen,
  panMask,
  goBackAgain,
  usePreservableState,
} from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper } from "./18.css";
import { Name } from "../../organisms/DataTable/DataTable.css";
import ServerApi from "../../../ServerApi";
import { Button } from "../../atoms/Button/Button";
import { useSelector } from "react-redux";
import { selectGlobal } from "../../../store/global";
import { DataTable } from "../../organisms/DataTable/DataTable";
import { useDataTable } from "../../../hooks/useDataTable";

function Screen18() {
  const global = useSelector(selectGlobal);
  const [patient] = usePreservableState("patient", {
    patient: global?.statePayload?.patient || { id: 0 },
  });

  const { data, form, formOnChange } = useDataTable({
    source: {
      path: "card",
      payload:
        patient && patient.id
          ? {
              patient_id: patient.id,
            }
          : null,
    },
  });

  if (patient.patient.id == 0) {
    goToHome();
    return null;
  }

  async function removeCard(card) {
    console.log(card);
    ServerApi.request({
      path: `remove_card/${card.id}`,
    }).then((data) => {
      if (data) {
        console.log(data);
        goBackAgain(18, { patient });
      }
    });
  }

  const nameView = (entry) => (
    <Name>{entry.patient_name || "- simple sale -"}</Name>
  );

  const actionView = (card) => {
    return (
      <Button variant={"inline"} onClick={() => removeCard(card)}>
        Remove
      </Button>
    );
  };

  const cardToken = (entry) => {
    return panMask(entry.card_token, entry.card_exp).split(", till ")[0];
  };

  const cardExp = (entry) => {
    return panMask(entry.card_token, entry.card_exp).split(", till ")[1];
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper style={{ padding: "0 5vw" }}>
        <BackButton onClick={goBack} />
        <Title>View Cards</Title>
        {patient && patient.id ? (
          <Button
            variant="fixed"
            onClick={() => {
              goToScreen(19, { patient });
            }}
          >
            Add Card
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
              name: "Customer",
              processor: (entry) => nameView(entry),
            },
            {
              name: "Card",
              processor: (entry) => cardToken(entry),
            },
            {
              name: "Exp,Date",
              processor: (entry) => cardExp(entry),
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

export { Screen18 };
