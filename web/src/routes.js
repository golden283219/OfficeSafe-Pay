import React from "react";
import { Switch, Route } from "react-router-dom";

import { Home } from "./components/pages/Home";
import { Sale } from "./components/pages/cc/Sale";
import { Authorize } from "./components/pages/cc/Authorize";
import { Capture } from "./components/pages/cc/Capture";
import { Refund } from "./components/pages/cc/Refund";
import { Void } from "./components/pages/cc/Void";
import { Transactions } from "./components/pages/reports/Transaction";
import { SubscriptionList } from "./components/pages/recurring/SubscriptionList";
import { PlanList } from "./components/pages/recurring/PlanList";
import { AddPlan } from "./components/pages/recurring/AddPlan";
import { AddSubscription } from "./components/pages/recurring/AddSubscription";
import { AddSubscriptionPlan } from "./components/pages/recurring/AddSubPlan";
import { AddCustomer } from "./components/pages/customer/addCustomer";
import { CustomerList } from "./components/pages/customer/customerList";
import { CustomerDetails } from "./components/pages/customer/customerDetail";
import { CustomerSale } from "./components/pages/customer/CustomerSale";
import { CustomerAuth } from "./components/pages/customer/CustomerAuth";
import { CustomerAddSubscription } from "./components/pages/customer/CustomerAddSubscription";
import { AddCustomerCard } from "./components/pages/customer/addCustomerCard";

function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/customer/add">
        <AddCustomer />
      </Route>
      <Route exact path="/customer/list">
        <CustomerList />
      </Route>
      <Route exact path="/customer/sale">
        <CustomerSale />
      </Route>
      <Route exact path="/customer/authorize">
        <CustomerAuth />
      </Route>
      <Route exact path="/customer/addsubscription">
        <CustomerAddSubscription />
      </Route>
      <Route exact path="/customer/add_card">
        <AddCustomerCard />
      </Route>
      <Route exact path="/customer/detail">
        <CustomerDetails />
      </Route>
      <Route exact path="/cc/sale">
        <Sale />
      </Route>
      <Route exact path="/cc/authorize">
        <Authorize />
      </Route>
      <Route exact path="/cc/capture">
        <Capture />
      </Route>
      <Route exact path="/cc/refund">
        <Refund />
      </Route>
      <Route exact path="/cc/void">
        <Void />
      </Route>
      <Route exact path="/reports/transactions">
        <Transactions />
      </Route>
      <Route exact path="/recurring/list_subscriptions">
        <SubscriptionList />
      </Route>
      <Route exact path="/recurring/list_plans">
        <PlanList />
      </Route>
      <Route exact path="/recurring/add_plan">
        <AddPlan />
      </Route>
      <Route exact path="/recurring/add_subscription">
        <AddSubscription />
      </Route>
      <Route exact path="/recurring/add_sub_plan">
        <AddSubscriptionPlan />
      </Route>
    </Switch>
  );
}

export default Routes;
