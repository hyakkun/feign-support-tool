import { popupEventsByPlayerName } from "./eventRows";
import { createLegacyPlayerOptions } from "./playerRows";

export const createBoardState = ({ board, playerNames, display, isTutorial = false, dayCount = 1 }) => ({
  board,
  playerNames,
  display: { playerIsIcon: true, nameIsIcon: true, ...display },
  isTutorial,
  dayCount,
});

export const selectTableData = (state) => state.board;

export const selectColorByPlayerName = (state) => state.board.reduce((colors, row) => (
  row.id >= 0 && row.color ? { ...colors, [row.name[0]]: row.color } : colors
), {});

export const selectPlayerOptions = (state, actionType) => (
  createLegacyPlayerOptions(state.playerNames, actionType.name)
);

export const selectPopupSnapshot = (state, day) => ({
  tableData: selectTableData(state),
  colorNameDic: selectColorByPlayerName(state),
  playerEvents: popupEventsByPlayerName(state.board, day),
  day,
});
