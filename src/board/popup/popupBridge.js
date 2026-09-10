import { selectPopupSnapshot } from "../state/boardState";

export const sendPopupSnapshot = ({ popupWindow, state, day, origin }) => {
  if (!popupWindow || popupWindow.closed) return false;

  const snapshot = selectPopupSnapshot(state, day);
  popupWindow.postMessage({
    type: "feign-board-snapshot",
    tableData: JSON.parse(JSON.stringify(snapshot.tableData)),
    colorNameDic: JSON.parse(JSON.stringify(snapshot.colorNameDic)),
    playerEvents: snapshot.playerEvents,
    day: snapshot.day,
  }, origin);
  return true;
};
