import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function usePatientList({ source }) {
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
          temp.customer = element.first_name + " " + element.last_name;
          temp.details = element.card_token;
          temp.customer_vault_id = element.customer_vault_id;
          temp.phone = element.phone;
          temp.address = element.address;
          return temp;
        });
        console.log(typeof result);
        setData(result);
      });
    }
  }, [source]);

  return { data };
}
