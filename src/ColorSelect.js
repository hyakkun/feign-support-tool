import React from "react";
import Select from "react-select";

export class ColorSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.row[props.dataField],
      name: props.row.id >= 0 ? props.row.name[0] : false,
    };
  }

  getValue() {
    return "newValue" in this ? this.newValue : this.state.value;
  }

  handleOnUpdate(event) {
    if (!event) return this.state.value;
    this.setState({ value: event.value });
    if (this.state.name) this.props.onColorChange?.(this.state.name, event.value);
    return event.value;
  }

  render() {
    const { value, onUpdate, ...rest } = this.props;
    const optionStyle = {
      display: "inline-block",
      width: "2rem",
      height: "2rem",
      margin: "0.05rem",
      borderRadius: "0.5rem",
      padding: "0",
      borderCollapse: "collapse",
      border: "0.05rem solid #aaa",
    };
    const customStyles = {
      option: (provided, state) => ({ ...provided, ...optionStyle, backgroundColor: state.data.value[1] }),
      control: (provided) => ({ ...provided, display: "flex" }),
      menu: (provided) => ({ ...provided, width: "fit-content" }),
      menuList: (provided) => ({ ...provided, width: "12.6rem" }),
      container: (provided) => ({ ...provided, whiteSpace: "normal", width: "fit-content" }),
    };

    return (
      <Select
        {...rest}
        isClearable={false}
        key={this.props.dataField}
        name={this.props.text}
        onChange={(event) => {
          this.newValue = this.handleOnUpdate(event);
          return onUpdate(this.getValue());
        }}
        className="select Color"
        defaultValue={() => {
          const color = this.props.row[this.props.dataField];
          return color ? { value: color, label: <div className="colorpicker" style={{ backgroundColor: color[1] }}>　</div> } : undefined;
        }}
        options={this.props.options.map((option) => ({ value: option, label: "　" }))}
        menuIsOpen
        autoFocus
        styles={customStyles}
      />
    );
  }
}
