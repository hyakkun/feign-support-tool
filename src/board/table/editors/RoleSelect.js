import React from "react";
import { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { LEGACY_SELECTOR } from "../../model/roleCatalog";
import { createRoleSelectState } from "./roleSelectState";
import { createRoleOptionToken } from "../../model/roleOptionTokens";

export class RoleSelect extends React.Component {
  constructor(props) {
    super(props);
    const roleSelectState = createRoleSelectState({ dataField: props.dataField, roleLabels: props.allRole, value: props.row[props.dataField], actionType: props.config.actionType });
    this.state = { value: props.row[props.dataField] ?? [], ...roleSelectState };
  }

  getValue() {
    return "newValue" in this ? this.newValue : this.state.value;
  }

  checkFinish() {
    const { actionType } = this.props.config;
    if (this.newValue.length <= this.state.value.length) {
      return !(this.state.isLook && this.newValue.length > 0);
    }
    const newItem = this.newValue[this.newValue.length - 1];
    if (this.state.isLook) return newItem[2] !== actionType.name;
    if (!this.state.isInv) return true;
    if (newItem[2] !== actionType.role) return true;
    const roles = this.newValue.filter((item) => item[2] === actionType.role);
    if (roles.length !== 1) return true;
    this.setState({ roleTypeNum: roles[0][1] === 1 ? -3 : -2 });
    return false;
  }

  handleOnUpdate(event) {
    if (!event) return true;
    this.newValue = event.map((item) => item.value);
    const finish = this.checkFinish();
    this.setState({ value: this.newValue });
    return finish;
  }

  render() {
    const { value, onUpdate, config, ...rest } = this.props;
    const { actionType, roleImage, roletypeColor } = config;
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
    const toggleRoleTypeNum = (typeNum) => {
      this.setState({ roleTypeNum: typeNum === this.state.roleTypeNum ? this.state.defaultRoleTypeNum : typeNum });
    };
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
    return <CreatableSelect
      {...rest}
      isMulti
      key={this.props.dataField}
      name={this.props.text}
      onChange={(event) => { if (this.handleOnUpdate(event)) return onUpdate(this.getValue()); }}
      className="selectRole"
      defaultValue={this.props.row[this.props.dataField].map((role) => ({
        value: role,
        label: role[2] !== actionType.name && role[0] in roleImage ? <img src={roleImage[role[0]]} alt={role[0]} /> : role[0],
      }))}
      options={this.props.options.map((option) => {
        let label = option.name;
        const token = createRoleOptionToken(option, this.state.roleTypeNum, actionType);
        if (option.actionType !== actionType.name && option.name in roleImage) {
          label = <span className="selectImg"><img className={option.actionType === actionType.role ? "roleImg" : undefined} src={roleImage[option.name]} alt={option.name} /></span>;
        }
        if (option.actionType === actionType.option && (option.name === "バ" || option.name === "真")) return { value: token, label: <span className="roleOption">{option.name}</span> };
        return { value: token, label };
      })}
      components={{ Option: typeButton }}
      styles={customStyles}
      menuIsOpen={true}
      autoFocus={true}
      isClearable={true}
      getNewOptionData={(newOptionString) => ({ value: [newOptionString, 0, 3], label: newOptionString })}
      closeMenuOnSelect={false}
      blurInputOnSelect={false}
      onMenuClose={() => onUpdate(this.getValue())}
    />;
  }
}
