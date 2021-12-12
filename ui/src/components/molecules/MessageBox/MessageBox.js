import React, { useEffect, useMemo, useState } from "react";
import styled from 'styled-components';
import { showMessageBoxEvent } from "../../../utils";

export function MessageBox() {
  const [config, setConfig] = useState({});

  const handler = (e) => {
    setConfig(e.detail)
  }

  const isShown = useMemo(() => {
    return config && ['confirm'].includes(config.type)
  }, [config]);

  const close = () => {
    setConfig({type: 'hide'});
  }

  useEffect(() => {
    window.addEventListener(showMessageBoxEvent, handler)
    return () => {
      window.removeEventListener(showMessageBoxEvent, handler)
    }
  }, [])

  if (!isShown)
    return null;

  return (
    <MessageHolder>
      <Overlay/>
      <Box>
        <Text>{config.text}</Text>
        <Actions>
          <ActionButton
            type="negative"
            onClick={() => {
              if (typeof config.onNegative === 'function') {
                config.onNegative();
              }
              close()
            }}
          >{config.negative}</ActionButton>
          <ActionButton
            onClick={() => {
              if (typeof config.onPositive === 'function') {
                config.onPositive();
              }
              close()
            }}
          >{config.positive}</ActionButton>
        </Actions>
      </Box>
    </MessageHolder>
  )
}

const MessageHolder = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
`;

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 70%);
  z-index: 100;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`;
const Box = styled.div`
  background-color: #2D2D2D;
  padding: 2rem 3rem;
  z-index: 200;
  text-align: center;
  max-width: 80vw;
`;
const Text = styled.div`
  color: white;
  font-size: 1.5rem;
`;
const Actions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-evenly;
  padding-top: 1rem;
`;
const ActionButton = styled.button`
  padding: 0 2rem;
  margin: 0 1rem;
  min-width: 180px;
  font-size: 1rem;
  line-height: 2;
  color: white;
  cursor: pointer;
  border: none;
  background-color: ${props => props.type === 'negative' ? '#FF6969' : '#0B69FF'};
`;
