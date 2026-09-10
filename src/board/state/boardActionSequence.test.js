import { BOARD_ACTION } from "./boardReducer";
import { createCellSaveActions } from "./boardActionSequence";

test("records magician death automatically for a self-destruct cell", () => {
  expect(createCellSaveActions({
    row: { id: -5, name: ["自爆", 19] }, column: { dataField: "target_day1" },
    value: [["アリス", 0, 2]], actionType: { name: 2 }, fixedDeathRoleForEvent: () => ["魔術師", 3, 1],
  })).toEqual([
    { type: BOARD_ACTION.UPDATE_CELL, rowId: -5, field: "target_day1", value: [["アリス", 0, 2]] },
    { type: BOARD_ACTION.RECORD_DEATH_ROLE, playerName: "アリス", roleToken: ["魔術師", 3, 1], preventDuplicate: true },
  ]);
});
