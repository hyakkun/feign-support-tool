import { roleIdsForRoleLabels } from "./roleCatalog";

export const createRoleSelectState = ({ dataField, roleLabels = [], value = [], actionType }) => {
  let defaultRoleTypeNum = dataField === "role" ? -1 : -2;
  const isActionDay = dataField.includes("action_day");
  const roleIds = isActionDay ? roleIdsForRoleLabels(roleLabels) : [];
  const isLook = roleIds.includes("lookout");
  const isInv = roleIds.includes("investigator");

  if (isInv) {
    const roles = value.filter((item) => item[2] === actionType.role);
    if (roles.length === 1 && roles[0][1] === 1) defaultRoleTypeNum = -3;
  }

  return { defaultRoleTypeNum, roleTypeNum: defaultRoleTypeNum, isLook, isInv };
};
