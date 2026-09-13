import React from "react";
import Select, { components } from "react-select";
import { LEGACY_SELECTOR } from "../../model/roleCatalog";

export class InsaneSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.row[props.dataField] ?? ["", 19], insane: false };
  }

  getValue() { return "newValue" in this ? this.newValue : this.state.value; }

  handleOnUpdate(event) {
    if (!event) return this.state.value;
    const value = [this.state.value[0], event.value];
    this.setState({ value });
    return value;
  }

  render() {
    const { value, onUpdate, optionBackgrounds, insaneRoleOptions, allRoleLabels, ...rest } = this.props;
    const optionStyle = { display: "inline-block", width: "4rem", padding: "0.1rem", borderCollapse: "collapse", border: "0.05rem solid #aaa" };
    const styles = {
      option: (provided, state) => ({ ...provided, ...optionStyle, ...optionBackgrounds[state.data?.value ?? 19] }),
      control: (provided) => ({ ...provided, display: "flex" }),
      menu: (provided) => ({ ...provided, width: "fit-content" }),
      menuList: (provided) => ({ ...provided, width: "16rem", marginLeft: "auto", marginRight: "auto" }),
      container: (provided) => ({ ...provided, whiteSpace: "normal", width: "fit-content" }),
    };
    const optionRenderer = (props) => props.data.label === LEGACY_SELECTOR.FACTION ? (
      <div style={{ marginTop: "0.3rem" }}><button className="role insane" onClick={() => this.setState({ insane: !this.state.insane })}>自称バカ</button></div>
    ) : <components.Option {...props} />;

    return <Select {...rest} isClearable={false} key={this.props.dataField} name={this.props.text}
      onChange={(event) => { this.newValue = this.handleOnUpdate(event); return onUpdate(this.getValue()); }}
      className="selectInsane"
      defaultValue={() => { const role = this.props.row[this.props.dataField]; return { value: role, label: `${role[0]}/${allRoleLabels[role[1]]?.name}` }; }}
      options={this.props.options.map((option) => {
        const selected = this.state.insane ? insaneRoleOptions[option.index] : option;
        return { value: selected.roletypeNum, label: selected.name };
      })}
      menuIsOpen autoFocus styles={styles} components={{ Option: optionRenderer }} />;
  }
}
