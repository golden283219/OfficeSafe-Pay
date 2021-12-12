import React, { useState, useEffect } from "react";
import ServerApi from "../ServerApi";

export function useDataTable({ source }) {
  const [DB, setDB] = useState([]);
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ search: "" });
  const [check, setCheck] = useState(true);

  const formOnChange = React.useCallback((event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  }, []);

  const filterData = () => {
    const keywords = form.search.trim();
    setData(
      DB.filter((entry) => {
        if (entry.first_name || entry.last_name) {
          if (
            (entry.first_name + " " + entry.last_name)
              .trim()
              .toLowerCase()
              .indexOf(keywords.trim().toLowerCase()) > -1
          )
            return true;
        } else if (entry.patient_name) {
          if (
            entry.patient_name
              .trim()
              .toLowerCase()
              .indexOf(keywords.trim().toLowerCase()) > -1
          )
            return true;
        }
      })
    );
  };

  useEffect(() => {
    filterData();
  }, [form]);

  useEffect(() => {
    if (data.length == 0 && check) {
      setCheck(false);
      ServerApi.request({
        path: source.path,
        payload: source.payload,
      }).then((res) => {
        setDB(res);
        setData(res);
        // TODO: apply patients filter when setPatientsDB operation completed
      });
    }
  }, [source]);

  return { data, form, formOnChange };
}
