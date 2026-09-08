import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardTable, createRowStyle } from "./BoardTable";

jest.mock("react-bootstrap-table-next", () => (props) => (
  <button onClick={() => props.cellEdit.afterSaveCell([], [["記録", 0, 3]], { id: 0 }, { dataField: "action_day1" })}>セル保存</button>
));

jest.mock("react-bootstrap-table2-editor", () => (options) => options);

jest.mock("reactstrap", () => ({ Container: ({ children }) => <div>{children}</div> }));

test("forwards table save and memo actions through the adapter contract", () => {
  const onCellSave = jest.fn();
  const onAddMemo = jest.fn();
  render(<BoardTable data={[]} columns={[]} tableKey="board" onCellSave={onCellSave} roleLabelBgColor={[]} onAddMemo={onAddMemo} />);

  fireEvent.click(screen.getByText("セル保存"));
  fireEvent.click(screen.getByText("メモ行追加"));

  expect(onCellSave).toHaveBeenCalledWith([], [["記録", 0, 3]], { id: 0 }, { dataField: "action_day1" });
  expect(onAddMemo).toHaveBeenCalledTimes(1);
});

test("derives event and player row backgrounds from role labels", () => {
  const rowStyle = createRowStyle(["#unknown", "#crew", "#imp", "#neutral", "#special"]);
  expect(rowStyle({ id: -1, name: ["追放", 19] })).toEqual({ background: "#eee" });
  expect(rowStyle({ id: 0, name: ["アリス", 1] })).toEqual({ background: "#crew" });
  expect(rowStyle({ id: 0, name: ["ボブ", 8] })).toEqual({ background: "#special" });
});
