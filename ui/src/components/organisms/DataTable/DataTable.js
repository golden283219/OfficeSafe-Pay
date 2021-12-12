import React from "react";
import PropTypes from "prop-types";
import { Textbox } from "../../molecules/Textbox/Textbox";
import SearchIcon from "../../../assets/images/icon-search.svg";
import {
  Wrapper,
  Form,
  Table,
  TableRow,
  TableRowsContainer,
  List,
  Entry,
} from "./DataTable.css";

function DataTable({ data, form, formOnChange, entryOnChoose, cols }) {
  return (
    <Wrapper>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Textbox
          placeholder="Search Patient"
          name="search"
          value={form.search}
          onChange={formOnChange}
          onInput={formOnChange}
          icon={SearchIcon}
          iconWidth={1.563}
          iconHeight={1.563}
          iconOnTheRight={true}
          iconExtendCSS={{ paddingLeft: "3rem", paddingRight: "0rem" }}
          extendClass="datatable-search"
        />
      </Form>
      {cols ? (
        <Table>
          <thead>
            <TableRow>
              {cols.map((col, key) => (
                <th key={col.name + key}>{col.name}</th>
              ))}
            </TableRow>
          </thead>
          <TableRowsContainer>
            {data.map((entry, key) => (
              <TableRow key={entry.id + "_" + key}>
                {cols.map((col, key) => (
                  <td key={entry.id + "__" + key}>{col.processor(entry)}</td>
                ))}
              </TableRow>
            ))}
          </TableRowsContainer>
        </Table>
      ) : (
        <List>
          {data && data.length ? (
            data.map((entry, key) => (
              <Entry
                key={entry.id + "_" + key}
                onClick={() => {
                  entryOnChoose(entry);
                }}
              >
                {entry.first_name + " " + entry.last_name}
              </Entry>
            ))
          ) : data === null ? (
            <div>Searching...</div>
          ) : (
            <div>No matched data for now</div>
          )}
        </List>
      )}
    </Wrapper>
  );
}

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  form: PropTypes.shape({ search: PropTypes.string }),
  formOnChange: PropTypes.func,
  entryOnChoose: PropTypes.func,
  cols: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      map: PropTypes.string,
      processor: PropTypes.func,
    })
  ),
};

export { DataTable };
