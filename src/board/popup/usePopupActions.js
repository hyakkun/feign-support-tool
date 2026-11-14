import { useCallback, useRef } from "react";
import { sendPopupSnapshot } from "./popupBridge";

export const usePopupActions = ({ controller, boardState, data, origin }) => {
  const sendPopup = useCallback((day, state = { ...boardState, board: data }) => {
    sendPopupSnapshot({ popupWindow: controller.getWindow(), state, day, origin });
  }, [boardState, controller, data, origin]);
  const latestSendPopup = useRef(sendPopup);
  const latestDay = useRef(boardState.dayCount);
  latestSendPopup.current = sendPopup;
  latestDay.current = boardState.dayCount;

  const openPopup = useCallback(() => {
    controller.open(() => latestSendPopup.current(latestDay.current));
  }, [controller]);
  return { openPopup, sendPopup };
};
