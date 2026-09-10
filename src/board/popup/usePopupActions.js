import { useCallback } from "react";
import { sendPopupSnapshot } from "./popupBridge";

export const usePopupActions = ({ controller, boardState, data, origin }) => {
  const sendPopup = useCallback((day, state = { ...boardState, board: data }) => {
    sendPopupSnapshot({ popupWindow: controller.getWindow(), state, day, origin });
  }, [boardState, controller, data, origin]);
  const openPopup = useCallback(() => controller.open(() => sendPopup(boardState.dayCount)), [boardState.dayCount, controller, sendPopup]);
  return { openPopup, sendPopup };
};
