import React from "react";
import { RoleSelect } from "./editors/RoleSelect";
import { sortDeadRoles, sortRoles } from "./boardColumnSorts";

const roleWithMarkers = (config) => [
  ...config.role,
  config.br,
  { id: 103, name: "バ", roletype: [true, false, false, false, false], actionType: 4 },
  { id: 104, name: "真", roletype: [true, false, false, false, false], actionType: 4 },
];

export const createRoleColumnDefinitions = ({ config, columnTemplate, formatters }) => ([
  {
    text: "役",
    dataField: "role",
    ...columnTemplate,
    formatter: formatters.cellFormatter("role"),
    sortFunc: sortRoles,
    editorRenderer: (editorProps, value, row, column) => {
      if (!(column.dataField in row)) row[column.dataField] = [];
      return <RoleSelect config={config} {...editorProps} value={value} row={row} options={roleWithMarkers(config)} dataField={column.dataField} text={column.text} />;
    },
  },
  {
    text: "死",
    dataField: "deadRole",
    formatter: formatters.cellFormatter("deadRole"),
    ...columnTemplate,
    sortFunc: sortDeadRoles,
    editorRenderer: (editorProps, value, row, column) => {
      if (!(column.dataField in row)) row[column.dataField] = [];
      return <RoleSelect config={config} {...editorProps} value={value} row={row} options={config.role} dataField={column.dataField} text={column.text} />;
    },
  },
]);
