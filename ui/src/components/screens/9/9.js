import { React } from "react";
import { goBack, goToScreen, usePreservableState } from "../../../utils";
import { BackButton } from "../../molecules/BackButton/BackButton";
import { Button } from "../../atoms/Button/Button";
import { Title } from "../../atoms/Title/Title";
import { BottomNavBar } from "../../molecules/BottomNavBar/BottomNavBar";
import { Wrapper, Card, Bacon } from "./9.css";
import { Icon } from "../../atoms/Icon/Icon";
import { Textbox } from "../../molecules/Textbox/Textbox";
import AcceptCardIcon from "../../../assets/images/icon-accept-card.svg";
import ForwardBigIcon from "../../../assets/images/icon-forward-big.svg";

/**
 * Simple payment without extras
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Screen9() {
  const [form, setForm] = usePreservableState("form", {
    amount: "0.01",
  });

  async function makePayment() {
    // processor
    // const [amount, type] = Processor.prepareAmount(form.amount);

    goToScreen(8, { type: "terminal", amount: form.amount, skipHistory: true });
  }

  const formOnChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  return (
    <div className="wrapper deduct-bottom-nav-bar">
      <Wrapper>
        <BackButton
          onClick={() => {
            goBack();
          }}
        />
        <Title>Terminal payment</Title>
        <Card>
          <Icon width={1.625} height={1.625} src={AcceptCardIcon} />
          <Bacon>Terminal</Bacon>
          <Title fontSize={1.125} noMargin>
            Insert or swipe the card
          </Title>
          <Textbox
            placeholder="Amount"
            name="amount"
            value={form.amount}
            onChange={formOnChange}
            onBlur={formOnChange}
            extendClass="amount-field"
          />
          <Button onClick={makePayment}>Start transaction</Button>
          <Icon
            width={9.281}
            height={8.25}
            src={ForwardBigIcon}
            extendClass="forward-big-icon"
          />
        </Card>
      </Wrapper>
      <BottomNavBar />
    </div>
  );
}
export { Screen9 };
