import React from "react";
import { ColorSelect } from "./ColorSelect";
import { InsaneSelect } from "./InsaneSelect";
import { sortColors, sortNames } from "./boardColumnSorts";

export const createIdentityColumnDefinitions = ({ config, runtime }) => ([
  {
    text: "　",
    dataField: "color",
    editable: true,
    sort: true,
    sortFunc: sortColors,
    formatter: (cell, row) => {
      if (cell && cell.length > 1) {
        if (runtime.getNameIsIcon() && row.id >= 0) {
          return <div className="tableCell" id={`color_tableid_${row.id}`}><div className="colorIconContainer"><img src={cell[0]} alt={`${row.name[0]}の色`} /></div></div>;
        }
        return <div className="tableCell" id={`color_tableid_${row.id}`}><div className="colorpicker" style={{ display: "block", backgroundColor: cell[1] }}>　</div></div>;
      }
      return <div className="tableCell" id={`color_tableid_${row.id}`}>　</div>;
    },
    editorRenderer: (editorProps, value, row, column) => {
      if (!(column.dataField in row)) row[column.dataField] = false;
      return <ColorSelect {...editorProps} value={value} row={row} options={config.colorList} dataField={column.dataField} text={column.text} onColorChange={(name, color) => runtime.handleColorChange(name, color)} />;
    },
  },
  {
    text: "名",
    dataField: "name",
    sort: true,
    sortFunc: sortNames,
    editable: true,
    formatter: (cell, row) => (
      cell
        ? <div className="tableCell" id={`name_tableid_${row.id}`}><span className="might" style={config.optionbackground[cell[1]]}>{cell[0]}</span></div>
        : <div className="tableCell" id={`name_tableid_${row.id}`}>　</div>
    ),
    editorRenderer: (editorProps, value, row, column) => (
      <InsaneSelect {...editorProps} value={value} row={row} options={config.roleLabel} optionBackgrounds={config.optionbackground} insaneRoleOptions={config.insaneRoleLabel} allRoleLabels={config.allRoleLabel} dataField={column.dataField} text={column.text} />
    ),
  },
]);
