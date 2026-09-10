import { ACTION_ITEM } from "./roleCatalog";
import { actionOptionsForRoleLabels, roleLabelsForRow } from "./actionOptions";

describe("action options", () => {
  const optionsByActionItem = {
    [ACTION_ITEM.ROLE]: ["role"],
    [ACTION_ITEM.PLAYER]: ["player"],
    [ACTION_ITEM.RESULT]: ["result"],
  };

  test("collects claimed and dead role labels from a player row", () => {
    expect(roleLabelsForRow({
      role: [["トラッカ", 1, 1]],
      deadRole: [["魔術師", 3, 1]],
    })).toEqual(["トラッカ", "魔術師"]);
  });

  test("orders role-specific action groups with separators", () => {
    expect(actionOptionsForRoleLabels(["トラッカ"], optionsByActionItem, "separator")).toEqual([
      "player", "separator", "result",
    ]);
    expect(actionOptionsForRoleLabels(["魔術師"], optionsByActionItem, "separator")).toEqual([
      "player", "separator", "role", "separator", "result",
    ]);
  });
});
