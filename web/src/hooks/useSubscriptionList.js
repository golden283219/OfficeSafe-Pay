import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function useSubscriptionList({ source }) {
  const [data, setData] = useState([]);
  const [check, setCheck] = useState(true);

  useEffect(() => {
    if (data.length == 0 && check) {
      setCheck(false);
      ServerApi.request({
        path: source.path,
        payload: source.payload,
      }).then((res) => {
        const result = res.map((element) => {
          if (element.transaction_id != null) {
            let temp = {};
            temp.id = element.transaction_id;
            temp.customer = element.firstname + " " + element.lastname;
            temp.details = element.card_token;
            temp.plan_id = element.plan_id;
            temp.created = element.created;
            temp.amount = element.amount;
            return temp;
          }
        });
        setData(
          result.filter(function (element) {
            return element !== undefined;
          })
        );
      });
    }
  }, [source]);

  return { data };
}
