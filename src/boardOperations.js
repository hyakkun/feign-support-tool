export const nextDayNumber = (columns) => (columns.length - 4) / 2 + 1;

export const createMemoRow = (rows) => {
  const id = Math.min(0, ...rows.map((row) => row.id)) - 1;
  return { keyid: id, id, name: ["メモ", 19] };
};

export const resetTableData = (rows, eventRows) => rows
  .filter((row) => row.id >= 0)
  .map((row) => ({ keyid: row.keyid, id: row.id, name: [row.name[0], 19], ...(row.color ? { color: row.color } : {}) }))
  .concat(eventRows.map((row) => ({ ...row })));
