import {
  createInitialTableData,
  createLegacyPlayerOptions,
  parsePlayerNames,
  reconcilePlayerRows,
} from "./playerRows";

describe("player rows", () => {
  test("parses non-empty unique player names in input order", () => {
    expect(parsePlayerNames("アリス\n\nボブ\nアリス\nキャロル")).toEqual([
      "アリス", "ボブ", "キャロル",
    ]);
  });

  test("creates legacy player options including the unknown player", () => {
    expect(createLegacyPlayerOptions(["アリス", "ボブ"], 2)).toEqual([
      { id: 200, name: "アリス", roletype: [true, true, true, true, true], actionType: 2 },
      { id: 201, name: "ボブ", roletype: [true, true, true, true, true], actionType: 2 },
      { id: 199, name: "？", roletype: [true, false, false, false, false], actionType: 2 },
    ]);
  });

  test("creates player rows before independent event row copies", () => {
    const eventRows = [{ id: -1, name: ["追放", 19] }];
    const rows = createInitialTableData(["アリス"], eventRows);

    expect(rows).toEqual([
      { keyid: 0, id: 0, name: ["アリス", 19] },
      { id: -1, name: ["追放", 19] },
    ]);
    expect(rows[1]).not.toBe(eventRows[0]);
  });

  test("reconciles changed names while preserving existing player and event data", () => {
    const alice = { keyid: 0, id: 0, name: ["アリス", 19], color: ["yellow", "#ffe352"], role: [["医者", 1, 1]] };
    const tableData = [
      alice,
      { keyid: 1, id: 1, name: ["ボブ", 19] },
      { keyid: -1, id: -1, name: ["追放", 19] },
      { keyid: -2, id: -2, name: ["殺害", 19] },
    ];

    const rows = reconcilePlayerRows(tableData, ["アリス", "ボブ"], ["アリス", "キャロル"]);

    expect(rows).toEqual([
      alice,
      { keyid: 2, id: 2, name: ["キャロル", 19] },
      { keyid: -1, id: -1, name: ["追放", 19] },
      { keyid: -2, id: -2, name: ["殺害", 19] },
    ]);
    expect(rows[0]).toBe(alice);
  });

  test("keeps memo and event rows when every player is removed", () => {
    const memo = { keyid: -8, id: -8, name: ["メモ", 19], action_day1: [["確認事項", 0, 3]] };
    const exile = { keyid: -1, id: -1, name: ["追放", 19] };

    expect(reconcilePlayerRows([
      { keyid: 0, id: 0, name: ["アリス", 19] },
      exile,
      memo,
    ], ["アリス"], [])).toEqual([exile, memo]);
  });

  test("preserves colors and death roles when keeping a player during an update", () => {
    const alice = {
      keyid: 0.1,
      id: 0,
      name: ["アリス", 19],
      color: ["yellow", "#ffe352"],
      deadRole: [["魔術師", 3, 1]],
    };
    const rows = reconcilePlayerRows([
      alice,
      { keyid: -1, id: -1, name: ["追放", 19] },
    ], ["アリス"], ["アリス"]);

    expect(rows[0]).toBe(alice);
    expect(rows[0].deadRole).toEqual([["魔術師", 3, 1]]);
    expect(rows[0].color).toEqual(["yellow", "#ffe352"]);
  });
});
