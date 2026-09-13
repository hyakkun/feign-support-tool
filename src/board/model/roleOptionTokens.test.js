import { createRoleOptionToken } from "./roleOptionTokens";

const actionType = { role: 1, option: 4 };
const flexibleRole = { name: "トラッカ", roletype: [true, true, true, false], defaultRoletype2: 1, actionType: 1 };

test("creates role and result tokens with the selected faction", () => {
  expect(createRoleOptionToken(flexibleRole, -2, actionType)).toEqual(["トラッカ", 1, 1]);
  expect(createRoleOptionToken(flexibleRole, 2, actionType)).toEqual(["トラッカ", 2, 1]);
  expect(createRoleOptionToken({ name: "バ", roletype: [], actionType: 4 }, -2, actionType)).toEqual(["バカ結果？", 4, 4]);
  expect(createRoleOptionToken({ name: "真結果", roletype: [], actionType: 4 }, -2, actionType)).toEqual(["真結果", 5, 4]);
});
