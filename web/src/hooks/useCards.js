import { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function useCards({ source }) {
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
          temp.customer = element.patient_name;
          temp.card_token = element.card_token;
          temp.card_exp =
            element.card_exp.slice(0, 2) + "/" + element.card_exp.slice(2);
          return temp;
        });
        setData(result);
      });
    }
  }, [source]);

  return { data };
}
