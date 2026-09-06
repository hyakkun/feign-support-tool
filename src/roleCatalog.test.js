import {
  ACTION_ITEM,
  FACTION,
  LEGACY_SELECTOR,
  ROLE_CATALOG,
  actionItemsForRoleLabels,
  createLegacyRoleOptions,
  createLegacyRoleToken,
  findRoleByLabel,
  roleIdsForRoleLabels,
} from "./roleCatalog";

describe("role catalog", () => {
  test("contains every existing role with its supported faction", () => {
    expect(ROLE_CATALOG).toHaveLength(17);
    expect(ROLE_CATALOG.find((role) => role.id === "snitch").factions).toEqual([FACTION.CREW, FACTION.IMP]);
    expect(ROLE_CATALOG.find((role) => role.id === "bomber").factions).toEqual([FACTION.NEUTRAL]);
  });

  test("derives the documented action candidates from role claims", () => {
    expect(actionItemsForRoleLabels(["スニッチ"])).toEqual([ACTION_ITEM.ROLE, ACTION_ITEM.RESULT]);
    expect(actionItemsForRoleLabels(["ねずみ"])).toEqual([ACTION_ITEM.ROLE, ACTION_ITEM.RESULT]);
    expect(actionItemsForRoleLabels(["トラッパ"])).toEqual([ACTION_ITEM.RESULT, ACTION_ITEM.PLAYER]);
    expect(actionItemsForRoleLabels(["？"])).toEqual([ACTION_ITEM.ROLE, ACTION_ITEM.PLAYER, ACTION_ITEM.RESULT]);
    expect(actionItemsForRoleLabels(["魔術師"])).toEqual([ACTION_ITEM.PLAYER, ACTION_ITEM.ROLE, ACTION_ITEM.RESULT]);
    expect(actionItemsForRoleLabels(["ゴースト"])).toEqual([ACTION_ITEM.PLAYER, ACTION_ITEM.RESULT]);
  });

  test("keeps action candidates specific to the added roles", () => {
    expect(actionItemsForRoleLabels(["トラッカ"])).toEqual([
      ACTION_ITEM.PLAYER,
      ACTION_ITEM.RESULT,
    ]);
    expect(actionItemsForRoleLabels(["魔術師"])).toEqual([
      ACTION_ITEM.PLAYER,
      ACTION_ITEM.ROLE,
      ACTION_ITEM.RESULT,
    ]);
    expect(actionItemsForRoleLabels(["ホーンタ"])).toEqual([
      ACTION_ITEM.PLAYER,
      ACTION_ITEM.RESULT,
    ]);
  });

  test("defines the new roles with their intended factions and interactions", () => {
    expect(findRoleByLabel("トラッカ")).toMatchObject({
      factions: [FACTION.CREW, FACTION.IMP],
      interaction: { kind: "observe-visit" },
    });
    expect(findRoleByLabel("魔術師")).toMatchObject({ factions: [FACTION.NEUTRAL] });
    expect(findRoleByLabel("ゴースト")).toMatchObject({ id: "haunter", label: "ホーンタ" });
  });

  test("keeps the legacy selector representation for existing roles", () => {
    const actionType = { role: 1 };
    const options = createLegacyRoleOptions(actionType);
    expect(options[0]).toMatchObject({ id: -2, name: LEGACY_SELECTOR.FACTION });
    expect(options.find((option) => option.name === "医者")).toMatchObject({
      id: 6,
      roletype: [true, true, false, false, true],
      actionType: 1,
    });
  });

  test("creates a neutral legacy token for the magician", () => {
    expect(createLegacyRoleToken("magician", { role: 1, option: 4 })).toEqual(["魔術師", 3, 1]);
  });

  test("creates compatible legacy tokens for each supported faction pattern", () => {
    const actionType = { role: 1, option: 4 };

    expect(createLegacyRoleToken("tracker", actionType)).toEqual(["トラッカ", 1, 1]);
    expect(createLegacyRoleToken("doctor", actionType)).toEqual(["医者", 1, 1]);
    expect(createLegacyRoleToken("blamer", actionType)).toEqual(["ブレイマ", 2, 1]);
    expect(createLegacyRoleToken("unknown", actionType)).toBeUndefined();
  });

  test("resolves legacy role labels to stable role IDs", () => {
    expect(roleIdsForRoleLabels(["ルック", "インベ", "ねずみ", "未定義"])).toEqual([
      "lookout", "investigator", "snitch",
    ]);
  });
});
