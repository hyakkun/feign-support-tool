import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoArea } from "./MemoArea";

test("renders the board memo input", () => {
  render(<MemoArea />);
  expect(screen.getByPlaceholderText("メモ")).toBeInTheDocument();
});
