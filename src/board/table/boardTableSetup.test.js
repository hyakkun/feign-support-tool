import { createBoardState } from "../state/boardState";
import { createBoardTableSetup } from "./boardTableSetup";

test("creates runtime-backed table definitions from board configuration", () => {
  const initialState = createBoardState({ board: [], playerNames: [] });
  const { config, runtime, tableDefinition } = createBoardTableSetup({ publicUrl: "/tool", initialState });

  expect(config.fixedDeathRoleForEvent("自爆")).toEqual(["魔術師", 3, 1]);
  expect(runtime.getTableData()).toEqual([]);
  expect(tableDefinition.tutorialBaseColumns.map((column) => column.dataField)).toEqual(["color", "name", "role", "deadRole"]);
  expect(tableDefinition.playerBaseColumns[1].text).toBe("名前");
});
