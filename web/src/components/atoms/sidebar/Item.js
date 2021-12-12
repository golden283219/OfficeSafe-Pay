import React from "react";
import { Wrapper, Icon } from "./Item.css";
import { Link } from "react-router-dom";

function Item({ icon, to, children }) {
  return (
    <Wrapper>
      <Link to={to} className="sidebar-link">
        <Icon src={icon} />
        {children}
      </Link>
    </Wrapper>
  );
}

export { Item };
