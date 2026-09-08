const compareValues = (valueA, valueB) => (
  valueA > valueB ? 1 : (valueA < valueB ? -1 : 0)
);

const applyOrder = (result, order) => (order === "asc" ? result : -result);

const compareEventRows = (rowA, rowB) => (
  rowA.id < 0 || rowB.id < 0 ? rowB.id - rowA.id : undefined
);

const isResultMarker = (items) => items && items.length && items[0][2] === 4;

const withoutResultMarkers = (items) => {
  const normalized = (items || []).slice();
  while (isResultMarker(normalized)) normalized.shift();
  return normalized;
};

export const sortCellItems = (valueA, valueB, order, dataField, rowA, rowB) => {
  const eventResult = compareEventRows(rowA, rowB);
  if (eventResult !== undefined) return eventResult;
  return applyOrder(compareValues(withoutResultMarkers(valueA), withoutResultMarkers(valueB)), order);
};

export const sortColors = (valueA, valueB, order, dataField, rowA, rowB) => {
  const eventResult = compareEventRows(rowA, rowB);
  if (eventResult !== undefined) return eventResult;
  return applyOrder(compareValues(valueA, valueB), order);
};

export const sortNames = (valueA, valueB, order, dataField, rowA, rowB) => {
  const eventResult = compareEventRows(rowA, rowB);
  if (eventResult !== undefined) return eventResult;
  const alignmentResult = compareValues(valueA[1], valueB[1]);
  const result = alignmentResult || compareValues(valueA[0], valueB[0]);
  return applyOrder(result, order);
};

export const sortRoles = (valueA, valueB, order, dataField, rowA, rowB) => {
  const eventResult = compareEventRows(rowA, rowB);
  if (eventResult !== undefined) return eventResult;
  const sortValue = (value, row) => {
    const items = withoutResultMarkers(value);
    if (items.length) return `${items[0][0]}z${items[0][1]}`;
    const deadRoles = withoutResultMarkers(row.deadRole);
    return deadRoles.length ? `${deadRoles[0][0]}0${deadRoles[0][1]}` : "";
  };
  return applyOrder(compareValues(sortValue(valueA, rowA), sortValue(valueB, rowB)), order);
};

export const sortDeadRoles = (valueA, valueB, order, dataField, rowA, rowB) => {
  const eventResult = compareEventRows(rowA, rowB);
  if (eventResult !== undefined) return eventResult;
  const sortValue = (value, row) => {
    const items = withoutResultMarkers(value);
    if (items.length) return `0${items[0][0]}${items[0][1]}`;
    const roles = withoutResultMarkers(row.role);
    return roles.length ? `2${roles[0][0]}${roles[0][1]}` : "1";
  };
  return applyOrder(compareValues(sortValue(valueA, rowA), sortValue(valueB, rowB)), order);
};
