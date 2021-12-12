import moment from "moment";
import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function useCustomerTransaction({ source }) {
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
          temp.id = element.id;
          temp.tx_id = element.tx_id;
          temp.date = moment(element.created).format("llll");
          temp.customer = element.patient_name;
          temp.type = element.type.toUpperCase();
          temp.amount = `$${element.amount.toFixed(2)}`;
          return temp;
        });
        setData(result);
      });
    }
  }, [source]);

  return { data };
}
