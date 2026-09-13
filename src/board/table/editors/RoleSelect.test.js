import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoleSelect } from "./RoleSelect";

jest.mock("react-select", () => ({ components: { Option: ({ children }) => <div>{children}</div> } }));

jest.mock("react-select/creatable", () => (props) => (
  <button onClick={() => props.onChange([{ value: ["アリス", 0, 2] }])}>候補を選択</button>
));

test("forwards a regular player selection to the cell update callback", () => {
  const onUpdate = jest.fn();
  render(<RoleSelect
    row={{ action_day1: [] }}
    dataField="action_day1"
    text="行動"
    value={[]}
    options={[{ name: "アリス", actionType: 2 }]}
    config={{
      actionType: { name: 2, role: 1, option: 4 },
      getColorNameDictionary: () => ({}),
      roleImage: {},
      roletypeColor: [],
    }}
    onUpdate={onUpdate}
  />);

  fireEvent.click(screen.getByText("候補を選択"));
  expect(onUpdate).toHaveBeenCalledWith([["アリス", 0, 2]]);
});
