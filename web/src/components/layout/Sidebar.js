import React from "react";
import { Wrapper, List } from "./Sidebar.css";
import { Title } from "../atoms/sidebar/Title";
import { Item } from "../atoms/sidebar/Item";
import icon from "../../assets/images/icons/test-icon.png";

function Sidebar() {
  return (
    <Wrapper>
      <Title>Customer vault</Title>
      <List>
        <Item icon={icon} to="/customer/add">
          Add Customer
        </Item>
        <Item icon={icon} to="/customer/list">
          Customer List
        </Item>
      </List>
      <Title>Credit cards</Title>
      <List>
        <Item icon={icon} to="/cc/sale">
          Sale
        </Item>
        <Item icon={icon} to="/cc/authorize">
          Authorize
        </Item>
        <Item icon={icon} to="/cc/capture">
          Capture
        </Item>
        <Item icon={icon} to="/cc/void">
          Void
        </Item>
        <Item icon={icon} to="/cc/refund">
          Refund
        </Item>
      </List>
      <Title>Recurring</Title>
      <List>
        <Item icon={icon} to="/recurring/add_subscription">
          Add Subscription
        </Item>
        <Item icon={icon} to="/recurring/list_subscriptions">
          List Subscriptions
        </Item>
        <Item icon={icon} to="/recurring/add_plan">
          Add Plan
        </Item>
        <Item icon={icon} to="/recurring/list_plans">
          List Plans
        </Item>
        <Item icon={icon} to="/recurring/add_sub_plan">
          Add Subscription and Plan
        </Item>
      </List>
      <Title>Reports</Title>
      <List>
        <Item icon={icon} to="/reports/transactions">
          Transactions
        </Item>
      </List>
    </Wrapper>
  );
}

export { Sidebar };
