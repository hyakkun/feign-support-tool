import React from "react";
import { render } from "@testing-library/react";
import { createBoardTableFormatters } from "./boardTableFormatters";

const formatterConfig = {
  actionType: { name: 2, created: 3, option: 4, role: 1 },
  getColorNameDictionary: () => ({ "アリス": ["yellow", "#ffe352"] }),
  getPlayerIsIcon: () => true,
  reviveImage: "/revive.png",
  roleImage: {},
  roletype: [],
};

test("injects board display configuration into the table formatter", () => {
  const formatters = createBoardTableFormatters(formatterConfig);

  const formatted = formatters.cellFormatter("action_day1")([["アリス", 0, 2]], { id: 0 });
  expect(formatted.props.children.props.children[0].props.className).toBe("iconContainer");
});

test("renders a death role animation without the findDOMNode fallback", () => {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  const formatters = createBoardTableFormatters(formatterConfig);
  const cell = [["アリス", 0, 2], ["魔術師", 3, 1, 0]];
  const row = { id: -1, name: ["自爆"], target_day1: cell };

  render(<>{formatters.deathFormatter("target_day1")(cell, row)}<div id="deadRole_tableid_0" /></>);

  expect(document.querySelector(".moveItem")).toBeInTheDocument();
  expect(consoleError.mock.calls.flat().join(" ")).not.toContain("findDOMNode");
  consoleError.mockRestore();
});
