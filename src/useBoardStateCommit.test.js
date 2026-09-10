import { BOARD_ACTION } from "./boardReducer";
import { applyBoardActions } from "./boardActionSequence";

test("applies actions before committing the replacement state", () => {
  const state = { board: [], dayCount: 1 };
  expect(applyBoardActions(state, [{ type: BOARD_ACTION.ADD_DAY }])).toEqual({ board: [], dayCount: 2 });
});
