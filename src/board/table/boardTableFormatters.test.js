import { createBoardTableFormatters } from "./boardTableFormatters";

test("injects board display configuration into the table formatter", () => {
  const formatters = createBoardTableFormatters({
    actionType: { name: 2, created: 3, option: 4, role: 1 },
    getColorNameDictionary: () => ({ "アリス": ["yellow", "#ffe352"] }),
    getPlayerIsIcon: () => true,
    reviveImage: "/revive.png",
    roleImage: {},
    roletype: [],
  });

  const formatted = formatters.cellFormatter("action_day1")([["アリス", 0, 2]], { id: 0 });
  expect(formatted.props.children.props.children[0].props.className).toBe("iconContainer");
});
