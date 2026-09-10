import React from "react";
import { ACTION_ITEM } from "../../roleCatalog";
import { actionOptionsForRoleLabels, roleLabelsForRow } from "../../actionOptions";
import {
  allowsReviveForEventLabel,
  isDeathEventLabel,
} from "../../eventRows";
import { RoleSelect } from "./editors/RoleSelect";
import { DeadSelect } from "./editors/DeadSelect";

export const createDayColumnDefinitions = ({ config, runtime, columnTemplate }) => {
  const targetDay = {
    ...columnTemplate,
    editorRenderer: (editorProps, value, row, column) => {
      if (!(column.dataField in row)) row[column.dataField] = [];
      let options = runtime.getPlayerOptions();
      if (row.id < 0) {
        if (isDeathEventLabel(row.name[0])) {
          return (
            <DeadSelect
              config={config}
              {...editorProps}
              value={value}
              row={row}
              options={runtime.getPlayerOptions().concat(config.actionRevive)}
              fixedDeathRole={config.fixedDeathRoleForEvent(row.name[0])}
              dataField={column.dataField}
              text={column.text}
            />
          );
        }
        if (allowsReviveForEventLabel(row.name[0])) options = options.concat(config.actionRevive);
      }
      return <RoleSelect config={config} {...editorProps} value={value} row={row} options={options} dataField={column.dataField} text={column.text} />;
    },
  };

  const actionDay = {
    text: "　",
    ...columnTemplate,
    editorRenderer: (editorProps, value, row, column) => {
      if (!(column.dataField in row)) row[column.dataField] = [];
      let allRole = [];
      if (row.id < 0 && isDeathEventLabel(row.name[0])) {
        return (
          <DeadSelect
            config={config}
            {...editorProps}
            value={value}
            row={row}
            options={runtime.getPlayerOptions().concat(config.actionRevive)}
            fixedDeathRole={config.fixedDeathRoleForEvent(row.name[0])}
            dataField={column.dataField}
            text={column.text}
          />
        );
      }
      if (row.id < 0 && allowsReviveForEventLabel(row.name[0])) {
        return <RoleSelect config={config} {...editorProps} value={value} row={row} options={runtime.getPlayerOptions().concat(config.actionRevive)} dataField={column.dataField} text={column.text} allRole={allRole} />;
      }
      allRole = roleLabelsForRow(row);
      const optionsByActionItem = {
        [ACTION_ITEM.ROLE]: config.role,
        [ACTION_ITEM.PLAYER]: runtime.getPlayerOptions(),
        [ACTION_ITEM.RESULT]: config.actionResult,
      };
      return <RoleSelect config={config} {...editorProps} value={value} row={row} options={actionOptionsForRoleLabels(allRole, optionsByActionItem, config.hr)} dataField={column.dataField} text={column.text} allRole={allRole} />;
    },
  };

  return { targetDay, actionDay };
};
