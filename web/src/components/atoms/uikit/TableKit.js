import { withStyles, makeStyles, useTheme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import PropTypes from "prop-types";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: 700,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const ClickableStyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: 700,
  },
  body: {
    fontSize: 14,
    cursor: "pointer",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  button: {
    fontSize: "0.8rem",
    border: "solid",
    borderColor: "#ddd",
    borderRadius: 0,
    borderWidth: 0.5,
  },
  active: {
    backgroundColor: "#435E73",
    color: "#fff",
    fontSize: "0.8rem",
    border: "solid",
    borderColor: "#435E73",
    borderRadius: 0,
    borderWidth: 0.5,
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        className={classes.button}
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        First
      </IconButton>
      <IconButton
        className={classes.button}
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        Previous
      </IconButton>
      <IconButton
        className={(classes.button, classes.active)}
        aria-label="current page"
      >
        {page + 1}
      </IconButton>
      <IconButton
        className={classes.button}
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        Next
      </IconButton>
      <IconButton
        className={classes.button}
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        Last
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export {
  ClickableStyledTableCell,
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
};
