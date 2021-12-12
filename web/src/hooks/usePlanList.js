import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function usePlanList({ source }) {
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
          let temp = {};
          temp.plan_name = element.plan_name;
          temp.customer = element.firstname + " " + element.lastname;
          temp.plan_id = element.plan_id;
          temp.cycle = `Every ${
            element.first_charge_date.split("-")[2] == 1
              ? "1st"
              : element.first_charge_date.split("-")[2] + "th"
          } day of the month`;
          temp.amount = element.amount;
          return temp;
        });
        setData(result);
      });
    }
  }, [source]);

  return { data };
}
