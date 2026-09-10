import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeadSelect } from "./DeadSelect";

jest.mock("react-select", () => ({ components: { Option: ({ children }) => <div>{children}</div> } }));

jest.mock("react-select/creatable", () => (props) => {
  const roleOption = props.options.find((option) => option.value?.[2] === 1);
  const selected = roleOption
    ? [{ value: ["アリス", 0, 2] }, { value: roleOption.value }]
    : [{ value: ["アリス", 0, 2] }];
  return <button onClick={() => props.onChange(selected)}>死亡者を選択</button>;
});

test("forwards a fixed-role death target without requiring role selection", () => {
  const onUpdate = jest.fn();
  render(<DeadSelect
    row={{ target_day1: [] }}
    dataField="target_day1"
    text="自爆"
    value={[]}
    options={[]}
    fixedDeathRole={["魔術師", 3, 1]}
    config={{
      actionType: { name: 2, role: 1, option: 4 },
      actionRevive: [],
      role: [],
      roleImage: {},
      roletypeColor: [],
      getColorNameDictionary: () => ({}),
      getPlayerOptions: () => [{ name: "アリス", actionType: 2 }],
      getTableData: () => [{ id: 0, name: ["アリス", 19] }],
    }}
    onUpdate={onUpdate}
  />);

  fireEvent.click(screen.getByText("死亡者を選択"));
  expect(onUpdate).toHaveBeenCalledWith([["アリス", 0, 2]]);
});

test("records a manually selected death role after selecting the player", () => {
  const onUpdate = jest.fn();
  render(<DeadSelect
    row={{ target_day1: [] }}
    dataField="target_day1"
    text="追放"
    value={[]}
    options={[]}
    config={{
      actionType: { name: 2, role: 1, option: 4 },
      actionRevive: [],
      role: [{ name: "医者", roletype: [false, true], defaultRoletype2: 1, actionType: 1 }],
      roleImage: {},
      roletypeColor: [],
      getColorNameDictionary: () => ({}),
      getPlayerOptions: () => [{ name: "アリス", actionType: 2 }],
      getTableData: () => [{ id: 4, name: ["アリス", 19] }],
    }}
    onUpdate={onUpdate}
  />);

  fireEvent.click(screen.getByText("死亡者を選択"));
  expect(onUpdate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("死亡者を選択"));
  expect(onUpdate).toHaveBeenCalledWith([
    ["アリス", 0, 2],
    ["医者", 1, 1, 4],
  ]);
});
