import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function useDataTable({ source }) {
  const [data, setData] = useState([]);
  const [check, setCheck] = useState(true);

  useEffect(() => {
    if (data.length == 0 && check) {
      setCheck(false);
      ServerApi.request({
        path: source.path,
        payload: source.payload,
      }).then((res) => {
        if (res.nm_response.transaction) {
          const result = res.nm_response.transaction.map((element) => {
            let temp = {};
            temp.id = element.transaction_id[0];
            temp.type = element.action[1]
              ? element.action[1].action_type[0].toUpperCase()
              : element.action[0].action_type[0].toUpperCase();
            temp.status = element.action[0].success[0] ? "Approved" : "Pending";
            temp.customer = [element.first_name[0], element.last_name[0]].join(
              " "
            );
            temp.details = element.cc_number[0];
            temp.time = element.action[1]
              ? element.action[1].date[0].slice(0, 4) +
                "-" +
                element.action[1].date[0].slice(4, 6) +
                "-" +
                element.action[1].date[0].slice(6, 8) +
                " " +
                element.action[1].date[0].slice(8, 10) +
                ":" +
                element.action[1].date[0].slice(10, 12) +
                ":" +
                element.action[1].date[0].slice(12, 14)
              : element.action[0].date[0].slice(0, 4) +
                "-" +
                element.action[0].date[0].slice(4, 6) +
                "-" +
                element.action[0].date[0].slice(6, 8) +
                " " +
                element.action[0].date[0].slice(8, 10) +
                ":" +
                element.action[0].date[0].slice(10, 12) +
                ":" +
                element.action[0].date[0].slice(12, 14);
            temp.amount = element.action[0].amount[0];
            return temp;
          });
          setData(result);
        }
      });
    }
  }, [source]);

  return { data };
}
