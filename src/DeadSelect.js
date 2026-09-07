import React from "react";
import { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { LEGACY_SELECTOR } from "./roleCatalog";
import { createDeathRoleAnimationToken, requiresDeathRoleSelection } from "./eventRows";

export class DeadSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.row[props.dataField] ?? [], roleTypeNum: -2, nameSelected: false };
  }

  getValue() {
    return "newValue" in this ? this.newValue : this.state.value;
  }

  handleOnUpdate(event) {
    if (!event) return true;
    const { actionType, getTableData } = this.props.config;
    this.newValue = event.map((item) => item.value);
    if (event.length > this.state.value.length) {
      const newItem = event[event.length - 1].value;
      if (this.state.nameSelected && newItem[2] === actionType.role) {
        const player = getTableData().find((item) => item.name[0] === this.state.nameSelected && item.id >= 0);
        this.setState({ nameSelected: false });
        if (player) this.newValue[this.newValue.length - 1] = createDeathRoleAnimationToken(newItem, player.id);
      } else if (!this.state.nameSelected && newItem[2] === actionType.name) {
        if (this.props.fixedDeathRole) {
          this.setState({ value: this.newValue, nameSelected: false });
          return true;
        }
        const player = getTableData().find((item) => item.name[0] === newItem[0] && item.id >= 0);
        this.setState({ value: this.newValue, nameSelected: newItem[0] });
        return Boolean(player && requiresDeathRoleSelection(player));
      }
    }
    this.setState({ value: this.newValue });
    return true;
  }

  render() {
    const { value, onUpdate, config, ...rest } = this.props;
    const { actionType, actionRevive, role, roleImage, roletypeColor } = config;
    const colorNameDic = config.getColorNameDictionary();
    const customStyles = {
      option: (provided, state) => {
        const style = {
          ...provided,
          display: "inline-block",
          width: typeof state.label === "string" ? "6rem" : (state.data.value[2] === 1 || state.data.value[2] === 4 ? "2.25rem" : "2rem"),
          padding: "0.1rem",
          borderCollapse: "collapse",
          border: "0.05rem solid #aaa",
          backgroundColor: roletypeColor[state.data.value[1]],
          boxSizing: "border-box",
        };
        if (state.data.value[2] === actionType.name && state.data.value[0] in colorNameDic) {
          style.background = `linear-gradient(transparent 80%, ${colorNameDic[state.data.value[0]][1]} 18%)`;
        }
        return style;
      },
      control: (provided) => ({ ...provided, display: "flex" }),
      multiValue: (provided, { data }) => (
        data.value[2] === actionType.name && data.value[0] in colorNameDic
          ? { ...provided, background: `linear-gradient(transparent 80%, ${colorNameDic[data.value[0]][1]} 18%)`, border: "1px solid #888" }
          : { ...provided, backgroundColor: roletypeColor[data.value[1]] }
      ),
      menu: (provided) => ({ ...provided, width: "fit-content" }),
      menuList: (provided) => ({ ...provided, width: "18rem", marginLeft: "auto", marginRight: "auto" }),
      container: (provided) => ({ ...provided, whiteSpace: "normal", width: "fit-content" }),
    };
    const toggleRoleTypeNum = (typeNum) => this.setState({ roleTypeNum: typeNum === this.state.roleTypeNum ? -2 : typeNum });
    const typeButton = (optionProps) => {
      if (optionProps.data.value?.length >= 2 && optionProps.data.value[2] !== actionType.name) {
        if (optionProps.data.value[0] === LEGACY_SELECTOR.FACTION) {
          return <div style={{ display: "flex" }}><button className="roleButton crew" onClick={() => toggleRoleTypeNum(1)}>crew</button><button className="roleButton imp" onClick={() => toggleRoleTypeNum(2)}>imp</button><button className="roleButton neutral" onClick={() => toggleRoleTypeNum(3)}>neutral</button><button className="roleButton unknown" onClick={() => toggleRoleTypeNum(0)}>none</button></div>;
        }
        if (optionProps.data.value[0] === "hr") return <hr style={{ display: "block" }} />;
        if (optionProps.data.value[0] === "br") return <br />;
      }
      return <components.Option {...optionProps} />;
    };
    const roleOptions = role.map((option) => {
      let label = option.name;
      let roleTypeNum = this.state.roleTypeNum < 0 ? (option[`defaultRoletype${-this.state.roleTypeNum}`] ?? 0) : (option.roletype[this.state.roleTypeNum] ? this.state.roleTypeNum : 0);
      if (option.actionType !== actionType.name && option.name in roleImage) {
        label = <span className="selectImg"><img className={option.actionType === actionType.role ? "roleImg" : undefined} src={roleImage[option.name]} alt={option.name} /></span>;
      }
      if (option.actionType === actionType.option) {
        if (option.name === "バ") return { value: ["バカ結果？", 4, 4], label: <span className="roleOption">バ</span> };
        if (option.name === "真") return { value: ["真結果", 5, 4], label: <span className="roleOption">真</span> };
        if (option.name === "バカ結果？") roleTypeNum = 4;
        if (option.name === "真結果") roleTypeNum = 5;
      }
      return { value: [option.name, roleTypeNum, option.actionType], label };
    });
    const nameOptions = config.getPlayerOptions().concat(actionRevive).map((option) => ({ value: [option.name, 0, option.actionType], label: option.name }));
    return <CreatableSelect
      {...rest}
      isMulti
      isClearable={false}
      key={this.props.dataField}
      name={this.props.text}
      onChange={(event) => { if (this.handleOnUpdate(event)) return onUpdate(this.getValue()); }}
      className="selectRole"
      defaultValue={this.props.row[this.props.dataField].map((item) => ({ value: item, label: item[2] !== actionType.name && item[0] in roleImage ? <img src={roleImage[item[0]]} alt={item[0]} /> : item[0] }))}
      options={this.state.nameSelected ? [...roleOptions, { value: ["蘇生", 0, actionType.option], label: <span className="roleOption">蘇</span> }] : nameOptions}
      components={{ Option: typeButton }}
      styles={customStyles}
      menuIsOpen={true}
      autoFocus={true}
      getNewOptionData={(newOptionString) => ({ value: [newOptionString, 0, 3], label: newOptionString })}
      closeMenuOnSelect={false}
      blurInputOnSelect={false}
      onMenuClose={() => onUpdate(this.getValue())}
    />;
  }
}
