export const createRoleOptionToken = (option, selectedRoleTypeNum, actionType) => {
  if (option.actionType === actionType.option && option.name === "バ") return ["バカ結果？", 4, actionType.option];
  if (option.actionType === actionType.option && option.name === "真") return ["真結果", 5, actionType.option];

  let roleTypeNum = selectedRoleTypeNum < 0
    ? (option[`defaultRoletype${-selectedRoleTypeNum}`] ?? 0)
    : (option.roletype[selectedRoleTypeNum] ? selectedRoleTypeNum : 0);
  if (option.actionType === actionType.option && option.name === "バカ結果？") roleTypeNum = 4;
  if (option.actionType === actionType.option && option.name === "真結果") roleTypeNum = 5;
  return [option.name, roleTypeNum, option.actionType];
};
