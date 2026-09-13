import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardTable, createRowStyle } from "./BoardTable";

test("forwards table save and memo actions through the adapter contract", () => {
  const onCellSave = jest.fn();
  const onAddMemo = jest.fn();
  const row = { id: 0, keyid: 0, action_day1: [] };
  const column = {
    text: "行動",
    dataField: "action_day1",
    editable: true,
    formatter: () => "編集",
    editorRenderer: ({ onUpdate }) => <button onClick={() => onUpdate([["記録", 0, 3]])}>セル保存</button>,
  };
  render(<BoardTable data={[row]} columns={[column]} tableKey="board" onCellSave={onCellSave} roleLabelBgColor={[]} onAddMemo={onAddMemo} />);

  fireEvent.click(screen.getByText("編集"));
  fireEvent.click(screen.getByText("セル保存"));
  fireEvent.click(screen.getByText("メモ行追加"));

  expect(onCellSave).toHaveBeenCalledWith([], [["記録", 0, 3]], row, column);
  expect(screen.queryByText("セル保存")).not.toBeInTheDocument();
  expect(screen.getByText("編集")).toBeInTheDocument();
  expect(onAddMemo).toHaveBeenCalledTimes(1);
});

test("derives event and player row backgrounds from role labels", () => {
  const rowStyle = createRowStyle(["#unknown", "#crew", "#imp", "#neutral", "#special"]);
  expect(rowStyle({ id: -1, name: ["追放", 19] })).toEqual({ background: "#eee" });
  expect(rowStyle({ id: 0, name: ["アリス", 1] })).toEqual({ background: "#crew" });
  expect(rowStyle({ id: 0, name: ["ボブ", 8] })).toEqual({ background: "#special" });
});

test("keeps the selected sort order when an edited board is rendered again", () => {
  const onCellSave = jest.fn();
  const rows = [
    { id: 1, keyid: 1, name: ["Bravo", 0], note: "before" },
    { id: 2, keyid: 2, name: ["Alpha", 0], note: "before" },
  ];
  const columns = [
    { text: "名前", dataField: "name", sort: true, formatter: (value) => value[0] },
    {
      text: "メモ",
      dataField: "note",
      editable: true,
      formatter: (value) => value,
      editorRenderer: ({ onUpdate }) => <button onClick={() => onUpdate("after")}>保存</button>,
    },
  ];
  const { container, rerender } = render(
    <BoardTable data={rows} columns={columns} tableKey="board" onCellSave={onCellSave} roleLabelBgColor={[]} onAddMemo={jest.fn()} />,
  );

  fireEvent.click(screen.getByText("名前"));
  expect([...container.querySelectorAll("tbody tr")].map((row) => row.cells[0].textContent)).toEqual(["Alpha", "Bravo"]);

  fireEvent.click(screen.getAllByText("before", { selector: "td" })[0]);
  fireEvent.click(screen.getByText("保存"));
  expect(onCellSave).toHaveBeenCalledWith("before", "after", rows[1], columns[1]);

  rerender(
    <BoardTable
      data={rows.map((row) => (row.name[0] === "Alpha" ? { ...row, note: "after" } : row))}
      columns={columns}
      tableKey="board"
      onCellSave={onCellSave}
      roleLabelBgColor={[]}
      onAddMemo={jest.fn()}
    />,
  );
  expect([...container.querySelectorAll("tbody tr")].map((row) => row.cells[0].textContent)).toEqual(["Alpha", "Bravo"]);
  expect(screen.getByText("after")).toBeInTheDocument();
});
