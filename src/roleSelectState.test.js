import { createRoleSelectState } from "./roleSelectState";

const actionType = { role: 1 };

test("derives action restrictions from stable role IDs", () => {
  expect(createRoleSelectState({ dataField: "action_day1", roleLabels: ["ルック"], actionType })).toMatchObject({ isLook: true, isInv: false, roleTypeNum: -2 });
  expect(createRoleSelectState({ dataField: "action_day1", roleLabels: ["インベ"], value: [["医者", 1, 1]], actionType })).toMatchObject({ isLook: false, isInv: true, roleTypeNum: -3 });
});
