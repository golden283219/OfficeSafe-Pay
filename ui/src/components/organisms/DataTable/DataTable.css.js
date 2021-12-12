import styled, { css } from "styled-components";

const Wrapper = styled.div`
  .datatable-search > div {
    border: none;
  }

  .datatable-search input,
  .datatable-search input::placeholder {
    font-size: 1.125rem;
    font-weight: 500;
    color: #3a3a3a;
    opacity: 1;
  }
`;

const Form = styled.form`
  min-width: 24.438rem;
`;

const Table = styled.table`
  background-color: rgba(196, 196, 196, 0.14);
  padding-left: 2.313rem;
  padding-right: 2.313rem;
  padding-top: 1.625rem;
`;

const TableRow = styled.tr`
  display: table;
  width: 100%;
  table-layout: fixed;

  th {
    text-align: left;
    font-weight: 800;
    font-size: 0.75rem;
  }

  .text-sm {
    font-size: 75%;
  }

  .text-xs {
    font-size: 50%;
  }
`;

const TableRowsContainer = styled.tbody`
  display: block;
  height: 50vh;
  overflow-y: auto;

  td {
    font-weight: 500;
    color: ;
  }
`;

const List = styled.div`
  margin-top: 1rem;
  width: 100%;
  padding-top: 0.425rem;
  padding-bottom: 1.125rem;
  padding-left: 0.875rem;
  padding-right: 0.875rem;
  background-color: rgba(196, 196, 196, 0.14);
  border-top: 0.063rem solid #2576f7;
  height: 40vh;
  overflow-y: auto;
`;

const Entry = styled.div`
  font-size: 1.125rem;
  font-weight: 800;
  margin-top: 0.7rem;
  padding: 0.5rem;

  :hover {
    cursor: pointer;
    background-color: #fcfdff;
  }
`;

const Name = styled.span`
  font-weight: 800;
`;

const Status = styled.span`
  font-weight: 800;
  ${(props) =>
    props.type === "failed" &&
    css`
      color: #ff0000;
    `}
`;

export {
  Wrapper,
  Form,
  Table,
  TableRow,
  TableRowsContainer,
  List,
  Entry,
  Name,
  Status,
};
