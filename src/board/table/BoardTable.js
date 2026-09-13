import React, { useEffect, useMemo, useState } from "react";

class BoardTableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (Array.isArray(this.props.fallbackData)) {
        return <div><h1>大変申し訳ありません、エラーが発生しました</h1><button onClick={() => this.setState({ hasError: false })}>リトライ</button><div>{this.props.fallbackData.map((item, index) => <div key={index}>{JSON.stringify(item)}</div>)}</div></div>;
      }
      return <h1>大変申し訳ありません、エラーが発生しました</h1>;
    }
    return this.props.children;
  }
}

export const createRowStyle = (roleLabelBgColor) => (row) => {
  if (row.id < 0) return { background: "#eee" };
  if (row.name && row.name[1] < roleLabelBgColor.length) {
    return { background: roleLabelBgColor[row.name[1]] };
  }
  if (row.name && row.name[1] > 4 && row.name[1] <= 11) {
    return { background: roleLabelBgColor[4] };
  }
  return undefined;
};

export const BoardTable = ({
  data,
  columns,
  tableKey,
  onCellSave,
  roleLabelBgColor,
  onAddMemo,
}) => {
  const rowStyle = createRowStyle(roleLabelBgColor);
  const [editingCell, setEditingCell] = useState(null);
  const [sort, setSort] = useState(null);

  useEffect(() => {
    setEditingCell(null);
  }, [tableKey]);

  const displayedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.dataField === sort.dataField);
    if (!column) return data;
    return [...data].sort((rowA, rowB) => {
      if (column.sortFunc) {
        return column.sortFunc(rowA[column.dataField], rowB[column.dataField], sort.order, column.dataField, rowA, rowB);
      }
      const valueA = rowA[column.dataField] ?? "";
      const valueB = rowB[column.dataField] ?? "";
      const result = valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
      return sort.order === "asc" ? result : -result;
    });
  }, [columns, data, sort]);

  const toggleSort = (column) => {
    if (!column.sort) return;
    setSort((current) => ({
      dataField: column.dataField,
      order: current?.dataField === column.dataField && current.order === "asc" ? "desc" : "asc",
    }));
  };

  const renderCell = (row, column) => {
    const isEditing = editingCell?.rowKey === row.keyid && editingCell.dataField === column.dataField;
    if (isEditing && column.editable !== false && column.editorRenderer) {
      return column.editorRenderer(
        {
          onUpdate: (newValue) => {
            onCellSave(row[column.dataField], newValue, row, column);
            setEditingCell(null);
          },
        },
        row[column.dataField],
        row,
        column,
      );
    }
    return column.formatter ? column.formatter(row[column.dataField], row) : row[column.dataField];
  };

  return (
    <div style={{ whiteSpace: "nowrap", display: "flex", alignItems: "flex-end" }}>
      <BoardTableErrorBoundary fallbackData={data}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.dataField} onClick={() => toggleSort(column)}>{column.text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row) => (
              <tr key={row.keyid} style={rowStyle(row)}>
                {columns.map((column) => (
                  <td
                    key={column.dataField}
                    onClick={() => {
                      if (editingCell?.rowKey === row.keyid && editingCell.dataField === column.dataField) return;
                      if (column.editable !== false && column.editorRenderer) {
                        setEditingCell({ rowKey: row.keyid, dataField: column.dataField });
                      }
                    }}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </BoardTableErrorBoundary>
      <button onClick={onAddMemo} style={{ height: "fit-content" }}>メモ行追加</button>
    </div>
  );
};
