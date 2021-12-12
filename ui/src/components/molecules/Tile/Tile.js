import React from "react";
import PropTypes from "prop-types";
import {
  Wrapper,
  SubWrapper,
  IconWrapper,
  TitleText,
  DescriptionText,
} from "./Tile.css";
import { Icon } from "../../atoms/Icon/Icon";

function Tile({
  onClick,
  color,
  iconWidth,
  iconHeight,
  iconSrc,
  title,
  description,
}) {
  return (
    <Wrapper onClick={onClick} background={color}>
      <SubWrapper>
        <IconWrapper>
          <Icon width={iconWidth} height={iconHeight} src={iconSrc} />
        </IconWrapper>
        <TitleText>{title}</TitleText>
        <DescriptionText>{description}</DescriptionText>
      </SubWrapper>
    </Wrapper>
  );
}

Tile.propTypes = {
  onClick: PropTypes.func,
  color: PropTypes.string,
  iconWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  iconHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  iconSrc: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};

export { Tile };
