import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FeignSupportToolRoot } from "./FeignSupportToolRoot";

const findRowByLabel = (label) => [...document.querySelectorAll("tbody tr")]
  .find((row) => [...row.cells].some((cell) => cell.textContent === label));

const findSelectOption = (label) => screen.getAllByText(label).find((element) => (
  element.id.startsWith("react-select-") && element.id.includes("-option-")
));

const playerNamesInRenderedOrder = () => [...document.querySelectorAll("tbody tr")]
  .filter((row) => Number(row.querySelector(".tableCell")?.id.match(/tableid_(-?\d+)/)?.[1]) >= 0)
  .map((row) => row.cells[1].textContent);

describe("FeignSupportToolRoot end-to-end cell editing", () => {
  beforeEach(() => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    window.confirm.mockRestore();
  });

  test("uses the latest participant names in a self-destruct target selector and saves the selection", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.change(screen.getByPlaceholderText(/名前入力欄/), { target: { value: "アリス\nボブ" } });
    fireEvent.click(screen.getByRole("button", { name: "setName" }));

    const selfDestructRow = findRowByLabel("自爆");
    expect(selfDestructRow).toBeDefined();
    fireEvent.click(selfDestructRow.cells[4]);

    expect(findSelectOption("アリス")).toBeInTheDocument();
    expect(findSelectOption("ボブ")).toBeInTheDocument();
    expect(screen.queryByText("名前例", { selector: "#react-select-2-option-0" })).not.toBeInTheDocument();

    fireEvent.click(findSelectOption("アリス"));
    expect(findRowByLabel("自爆").cells[4]).toHaveTextContent("アリス");
  });

  test("keeps the name sort order after adding a day", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.change(screen.getByPlaceholderText(/名前入力欄/), { target: { value: "ボブ\nアリス" } });
    fireEvent.click(screen.getByRole("button", { name: "setName" }));
    fireEvent.click(screen.getByRole("columnheader", { name: "名前" }));

    expect(playerNamesInRenderedOrder()).toEqual(["アリス", "ボブ"]);
    fireEvent.click(screen.getByRole("button", { name: "翌日" }));
    expect(playerNamesInRenderedOrder()).toEqual(["アリス", "ボブ"]);
  });

  test("updates the rendered name icon after selecting a color", () => {
    render(<FeignSupportToolRoot />);

    const firstPlayerRow = document.querySelector("tbody tr");
    fireEvent.click(firstPlayerRow.cells[0]);
    const colorOptions = [...document.querySelectorAll('[id^="react-select-"][id*="-option-"]')];
    expect(colorOptions).not.toHaveLength(0);

    fireEvent.click(colorOptions[0]);
    expect(screen.getByAltText("名前例の色")).toHaveAttribute("src", expect.stringContaining("/icon/White.png"));
  });
});
