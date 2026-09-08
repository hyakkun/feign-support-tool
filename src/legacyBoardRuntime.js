import {
  selectColorByPlayerName,
  selectPlayerOptions,
  selectTableData,
} from "./boardState";

export const createLegacyBoardRuntime = ({ initialState, actionType }) => {
  let boardState = initialState;
  let colorChangeHandler;

  return {
    sync(nextState) {
      boardState = nextState;
    },
    getTableData() {
      return selectTableData(boardState);
    },
    getColorNameDictionary() {
      return selectColorByPlayerName(boardState);
    },
    getPlayerOptions() {
      return selectPlayerOptions(boardState, actionType);
    },
    getPlayerIsIcon() {
      return boardState.display.playerIsIcon;
    },
    getNameIsIcon() {
      return boardState.display.nameIsIcon;
    },
    setColorChangeHandler(handler) {
      colorChangeHandler = handler;
    },
    handleColorChange(playerName, color) {
      return colorChangeHandler?.(playerName, color);
    },
  };
};
