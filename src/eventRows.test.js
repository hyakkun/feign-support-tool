import {
  EVENT_ROWS,
  appendDeadRole,
  appendDeadRoleIfAbsent,
  createDeathRoleAnimationToken,
  allowsReviveForEventLabel,
  createLegacyEventRows,
  fixedDeathRoleIdForEventLabel,
  findEventByLabel,
  isDeathEventLabel,
  popupEventsByPlayerName,
  requiresDeathRoleSelection,
} from "./eventRows";

describe("event rows", () => {
  test("includes self-destruct and chain-death in the fixed rows", () => {
    expect(EVENT_ROWS.map((eventRow) => eventRow.label)).toEqual([
      "追放", "殺害", "爆発", "道連れ", "自爆", "医者", "対立", "ﾗｲﾝ",
    ]);
    expect(isDeathEventLabel("自爆")).toBe(true);
    expect(isDeathEventLabel("道連れ")).toBe(true);
    expect(fixedDeathRoleIdForEventLabel("自爆")).toBe("magician");
    expect(fixedDeathRoleIdForEventLabel("道連れ")).toBeUndefined();
  });

  test("defines which fixed event rows accept revive as an action", () => {
    expect(findEventByLabel("爆発")).toMatchObject({ type: "explosion" });
    expect(allowsReviveForEventLabel("爆発")).toBe(true);
    expect(allowsReviveForEventLabel("医者")).toBe(true);
    expect(allowsReviveForEventLabel("自爆")).toBe(false);
    expect(allowsReviveForEventLabel("未定義")).toBe(false);
  });

  test("keeps legacy rows compatible with the current table", () => {
    const rows = createLegacyEventRows({ role: 1 });
    expect(rows.find((row) => row.name[0] === "爆発").role).toEqual([["ボマー", 3, 1]]);
    expect(rows.find((row) => row.name[0] === "道連れ")).toMatchObject({ id: -4, keyid: -4 });
  });

  test("maps self-destruct and chain-death entries to the affected player", () => {
    const tableData = [
      { id: -4, name: ["道連れ", 19], target_day1: [["ボブ", 0, 2]] },
      { id: -5, name: ["自爆", 19], target_day1: [["アリス", 0, 2]], action_day1: [["ボブ", 0, 2]] },
    ];
    expect(popupEventsByPlayerName(tableData, 1)).toEqual({
      "アリス": ["自爆"],
      "ボブ": ["道連れ", "自爆"],
    });
  });

  test("keeps popup events limited to players and removes duplicate event labels", () => {
    const tableData = [
      {
        id: -4,
        name: ["道連れ", 19],
        target_day1: [["ボブ", 0, 2], ["魔術師", 3, 1]],
        action_day1: [["ボブ", 0, 2], ["成功", 0, 0]],
      },
      { id: -5, name: ["自爆", 19], action_day1: [["アリス", 0, 2]] },
    ];

    expect(popupEventsByPlayerName(tableData, 1)).toEqual({
      "ボブ": ["道連れ"],
      "アリス": ["自爆"],
    });
  });

  test("keeps popup events scoped to the requested day", () => {
    const tableData = [
      { id: -4, name: ["道連れ", 19], target_day1: [["アリス", 0, 2]] },
      { id: -5, name: ["自爆", 19], action_day2: [["ボブ", 0, 2]] },
    ];

    expect(popupEventsByPlayerName(tableData, 1)).toEqual({ "アリス": ["道連れ"] });
    expect(popupEventsByPlayerName(tableData, 2)).toEqual({ "ボブ": ["自爆"] });
    expect(popupEventsByPlayerName(tableData, 3)).toEqual({});
  });

  test("adds the fixed magician death role once without mutating the player row", () => {
    const player = { id: 1, name: ["アリス", 19], deadRole: [["シーフ", 3, 1]] };
    const magician = ["魔術師", 3, 1];

    expect(appendDeadRoleIfAbsent(player, magician)).toEqual({
      id: 1,
      name: ["アリス", 19],
      deadRole: [["シーフ", 3, 1], ["魔術師", 3, 1]],
    });
    expect(player.deadRole).toEqual([["シーフ", 3, 1]]);
    expect(appendDeadRoleIfAbsent(player, ["シーフ", 3, 1])).toBe(player);
  });

  test("adds a manually recorded death role without mutating its inputs", () => {
    const player = { id: 1, name: ["アリス", 19], deadRole: [["シーフ", 3, 1]] };
    const roleToken = ["トラッカ", 1, 1];

    expect(appendDeadRole(player, roleToken)).toEqual({
      id: 1,
      name: ["アリス", 19],
      deadRole: [["シーフ", 3, 1], ["トラッカ", 1, 1]],
    });
    expect(player.deadRole).toEqual([["シーフ", 3, 1]]);
    expect(roleToken).toEqual(["トラッカ", 1, 1]);
  });

  test("derives death-role follow-up and animation data from player data", () => {
    expect(requiresDeathRoleSelection({ deadRole: [["医者", 1, 1]] })).toBe(true);
    expect(requiresDeathRoleSelection({})).toBe(false);
    expect(createDeathRoleAnimationToken(["魔術師", 3, 1], 4)).toEqual(["魔術師", 3, 1, 4]);
  });
});
