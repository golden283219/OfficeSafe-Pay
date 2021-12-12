import styled from "styled-components";

const Wrapper = styled.div`
  background: #ffffff;
  border: 0.019rem solid #cccccc;
  border-radius: 0.75rem 0.75rem 0rem 0rem;
  width: 100%;
  height: 4rem;
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
`;

const HomeButton = styled.div`
  margin-left: 3.4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all linear 70ms;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;

const HomeButtonText = styled.div`
  margin-top: 0.563rem;
  font-size: 0.563rem;
  font-weight: 400;
  color: #37393d;
`;

const SupportButton = styled.div`
  position: relative;
  top: -0.188rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all linear 70ms;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;

const SupportButtonText = styled.div`
  font-size: 0.563rem;
  font-weight: 400;
  color: #37393d;
`;

const NotificationsButton = styled.div`
  margin-right: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all linear 70ms;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;

const NotificationsButtonText = styled.div`
  margin-top: 0.125rem;
  font-size: 0.563rem;
  font-weight: 400;
  color: #37393d;
`;

//TODO Question to designer: Is it OK to use Arial here?
const NotificationsBubble = styled.div`
  position: absolute;
  background-color: #ff4948;
  top: 0.5rem;
  margin-left: 2rem;
  z-index: 1;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: #37393d;
  font-family: Arial;
  font-size: 0.75rem;
`;

//TODO Still required?
const AppVersion = styled.div`
  display: none;
  position: absolute;
  right: 2vw;
  opacity: 0.5;
  font-size: 0.75em;
`;

export {
  Wrapper,
  HomeButton,
  HomeButtonText,
  SupportButton,
  SupportButtonText,
  NotificationsButton,
  NotificationsButtonText,
  NotificationsBubble,
  AppVersion,
};
