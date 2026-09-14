import { act, fireEvent, screen } from "@testing-library/react";
import { mountFeignSupportTool } from "./app/bootstrap";

describe("display options", () => {
  let root;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    act(() => {
      root = mountFeignSupportTool(document.getElementById("root"));
    });
  });

  afterEach(() => {
    act(() => root.unmount());
  });

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
