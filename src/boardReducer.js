import { createMemoRow } from "./boardOperations";
import { resetTableData } from "./boardOperations";
import { createInitialTableData, reconcilePlayerRows } from "./board/model/playerRows";
import { appendDeadRole, appendDeadRoleIfAbsent } from "./board/model/eventRows";

export const BOARD_ACTION = Object.freeze({
  SET_DISPLAY_OPTION: "set-display-option",
  ADD_DAY: "add-day",
  ADD_MEMO_ROW: "add-memo-row",
  SET_PLAYER_NAMES: "set-player-names",
  SET_PLAYER_COLOR: "set-player-color",
  UPDATE_CELL: "update-cell",
  RECORD_DEATH_ROLE: "record-death-role",
  REPLACE_STATE: "replace-state",
  RESET_BOARD: "reset-board",
  INITIALIZE_BOARD: "initialize-board",
});

export const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTION.REPLACE_STATE:
      return action.state;
    case BOARD_ACTION.INITIALIZE_BOARD:
      return {
        ...state,
        board: createInitialTableData(action.playerNames, action.eventRows),
        playerNames: action.playerNames,
        isTutorial: false,
        dayCount: 1,
      };
    case BOARD_ACTION.RESET_BOARD:
      return { ...state, board: resetTableData(state.board, action.eventRows), dayCount: 1 };
    case BOARD_ACTION.SET_DISPLAY_OPTION:
      return { ...state, display: { ...state.display, [action.option]: action.value } };
    case BOARD_ACTION.ADD_DAY:
      return { ...state, dayCount: state.dayCount + 1 };
    case BOARD_ACTION.ADD_MEMO_ROW:
      return { ...state, board: [...state.board, createMemoRow(state.board)] };
    case BOARD_ACTION.SET_PLAYER_NAMES:
      return {
        ...state,
        playerNames: action.playerNames,
        board: reconcilePlayerRows(state.board, state.playerNames, action.playerNames),
      };
    case BOARD_ACTION.SET_PLAYER_COLOR:
      return {
        ...state,
        board: state.board.map((row) => (
          row.id >= 0 && row.name[0] === action.playerName ? { ...row, color: action.color } : row
        )),
      };
    case BOARD_ACTION.UPDATE_CELL:
      return {
        ...state,
        board: state.board.map((row) => (
          row.id === action.rowId ? { ...row, [action.field]: action.value } : row
        )),
      };
    case BOARD_ACTION.RECORD_DEATH_ROLE:
      return {
        ...state,
        board: state.board.map((row) => {
          if (row.id < 0 || row.name[0] !== action.playerName) return row;
          return action.preventDuplicate
            ? appendDeadRoleIfAbsent(row, action.roleToken)
            : appendDeadRole(row, action.roleToken);
        }),
      };
    default:
      return state;
  }
};
