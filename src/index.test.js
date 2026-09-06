import { fireEvent, screen } from "@testing-library/react";

jest.mock("react-bootstrap-table-next", () => {
  const React = require("react");
  return ({ data, columns }) => (
    <div data-testid="table">
      {data.flatMap((row) => columns.map((column) => (
        <React.Fragment key={`${row.keyid}-${column.dataField}`}>
          {column.formatter?.(row[column.dataField], row)}
        </React.Fragment>
      )))}
    </div>
  );
});

jest.mock("react-bootstrap-table2-editor", () => () => ({}));

jest.mock("reactstrap", () => {
  const React = require("react");
  return {
    Container: ({ children }) => <div>{children}</div>,
  };
});

document.body.innerHTML = '<div id="root"></div>';
require("./index");

describe("display options", () => {
  test("updates existing color cells when the name icon option is toggled", () => {
    const checkbox = screen.getByLabelText("名前欄アイコン");

    expect(checkbox).toBeChecked();
    expect(screen.getByAltText("名前例の色")).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.queryByAltText("名前例の色")).not.toBeInTheDocument();
  });

  test("updates existing player cells when the player icon option is toggled", () => {
    const checkbox = screen.getByLabelText("アイコン");

    expect(checkbox).toBeChecked();
    expect(screen.getByAltText("最初に")).toBeInTheDocument();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.queryByAltText("最初に")).not.toBeInTheDocument();
  });
});
