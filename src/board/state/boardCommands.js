import { BOARD_ACTION } from "./boardReducer";

export const initializeBoard = (playerNames, eventRows) => ({
  type: BOARD_ACTION.INITIALIZE_BOARD,
  playerNames,
  eventRows,
});

export const setPlayerNames = (playerNames) => ({
  type: BOARD_ACTION.SET_PLAYER_NAMES,
  playerNames,
});

export const resetBoard = (eventRows) => ({ type: BOARD_ACTION.RESET_BOARD, eventRows });
export const addDay = () => ({ type: BOARD_ACTION.ADD_DAY });
export const addMemoRow = () => ({ type: BOARD_ACTION.ADD_MEMO_ROW });
export const setDisplayOption = (option, value) => ({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option, value });
