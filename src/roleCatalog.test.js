import {
  ACTION_ITEM,
  FACTION,
  ROLE_CATALOG,
  actionItemsForRoleLabels,
  createLegacyRoleOptions,
} from "./roleCatalog";

describe("role catalog", () => {
  test("contains every existing role with its supported faction", () => {
    expect(ROLE_CATALOG).toHaveLength(14);
    expect(ROLE_CATALOG.find((role) => role.id === "snitch").factions).toEqual([FACTION.CREW, FACTION.IMP]);
    expect(ROLE_CATALOG.find((role) => role.id === "bomber").factions).toEqual([FACTION.NEUTRAL]);
  });

  test("derives the documented action candidates from role claims", () => {
    expect(actionItemsForRoleLabels(["ねずみ"])).toEqual([ACTION_ITEM.ROLE, ACTION_ITEM.RESULT]);
    expect(actionItemsForRoleLabels(["トラッパ"])).toEqual([ACTION_ITEM.RESULT, ACTION_ITEM.PLAYER]);
    expect(actionItemsForRoleLabels(["？"])).toEqual([ACTION_ITEM.ROLE, ACTION_ITEM.PLAYER, ACTION_ITEM.RESULT]);
  });

  test("keeps the legacy selector representation for existing roles", () => {
    const actionType = { role: 1 };
    const options = createLegacyRoleOptions(actionType);
    expect(options[0]).toMatchObject({ id: -2, name: "Hoge" });
    expect(options.find((option) => option.name === "医者")).toMatchObject({
      id: 6,
      roletype: [true, true, false, false, true],
      actionType: 1,
    });
  });
});
