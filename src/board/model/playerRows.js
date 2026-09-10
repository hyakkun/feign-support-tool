export const parsePlayerNames = (input) => [...new Set(input.split("\n"))]
  .filter((name) => name !== "");

export const createLegacyPlayerOptions = (names, actionType) => names
  .map((name, index) => ({
    id: index + 200,
    name,
    roletype: [true, true, true, true, true],
    actionType,
  }))
  .concat({
    id: 199,
    name: "？",
    roletype: [true, false, false, false, false],
    actionType,
  });

export const createInitialTableData = (names, eventRows) => names
  .map((name, index) => ({ keyid: index, id: index, name: [name, 19] }))
  .concat(eventRows.map((eventRow) => ({ ...eventRow })));

export const reconcilePlayerRows = (tableData, previousNames, nextNames) => {
  let maxId = 0;
  let exileRow;
  const nextNameSet = new Set(nextNames);
  const rows = tableData.filter((row) => {
    if (row.id > maxId) maxId = row.id;
    if (row.id === -1) exileRow = row;
    return row.id < 0 || nextNameSet.has(row.name[0]);
  });

  if (!exileRow) return rows;

  nextNames.forEach((name) => {
    if (previousNames.includes(name)) return;
    maxId += 1;
    rows.splice(rows.indexOf(exileRow), 0, {
      keyid: maxId,
      id: maxId,
      name: [name, 19],
    });
  });
  return rows;
};
