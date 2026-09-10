import { actionItemsForRoleLabels } from "./roleCatalog";

export const roleLabelsForRow = (row) => [
  ...(row.role || []),
  ...(row.deadRole || []),
].map((item) => item[0]);

export const actionOptionsForRoleLabels = (roleLabels, optionsByActionItem, separator) => (
  actionItemsForRoleLabels(roleLabels).flatMap((actionItem, index) => [
    ...(index ? [separator] : []),
    ...optionsByActionItem[actionItem],
  ])
);
