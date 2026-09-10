import React, { useState } from "react";
import { Transition } from "react-transition-group";

const MoveItem = ({ num, startId, endId, item }) => {
  const [animate, setAnimate] = useState(true);
  const startTransform = `translate(${1.67 * num}rem,0)`;
  const endTransform = () => {
    const startElement = document.getElementById(startId);
    const endElement = document.getElementById(endId);
    if (!startElement || !endElement) return "translate(0,0)";

    const startPos = startElement.getBoundingClientRect();
    const endPos = endElement.getBoundingClientRect();
    return `translate(${(endPos.left - startPos.left) / 0.9}px,${(endPos.top - startPos.top) / 0.9}px)`;
  };

  return (
    <Transition in={animate} appear timeout={{ enter: 10, exit: 1100 }} unmountOnExit onEntered={() => setAnimate(false)}>
      {(state) => <span className="moveItem" style={{ transform: state === "entering" ? startTransform : endTransform() }}>{item}</span>}
    </Transition>
  );
};

export const createTableFormatters = ({
  actionType,
  getColorNameDictionary,
  getPlayerIsIcon,
  isDeathEventLabel,
  reviveImage,
  roleImage,
  roletype,
}) => {
  const cellFormatter = (dataField) => (cell, row) => {
    let insane = false;
    let sane = false;
    let important = false;
    let directionColumn = row.id < 0;
    if (getPlayerIsIcon()) directionColumn = false;
    else if (!directionColumn && cell?.filter((item) => item[2] === actionType.name).length > 1) directionColumn = true;

    let roles = cell?.map((item, index) => {
      if (item[2] !== actionType.name) {
        if (item[2] > actionType.created) {
          if (item[0] === "バカ結果？") {
            insane = true;
            return null;
          }
          if (item[0] === "真結果") {
            sane = true;
            return null;
          }
          if (item[0] === "重要結果") {
            important = true;
            return null;
          }
          if (!directionColumn && item[2] === actionType.option && item[0] === "蘇生" && index > 0) {
            return <span key={item + index} style={{ position: "relative" }}><img className="revive" src={reviveImage} alt={item[0]} /></span>;
          }
        }
        if (item[0] in roleImage) return <img key={item + index} className={roletype[item[1]]} src={roleImage[item[0]]} alt={item[0]} />;
      } else if (getPlayerIsIcon() && item[0] in getColorNameDictionary()) {
        return <span key={item + index} className="iconContainer"><img src={getColorNameDictionary()[item[0]][0]} alt={item[0]} /><span className="iconTextContainer"><span className="iconText">{item[0]}</span></span></span>;
      }
      if (directionColumn && item[2] === actionType.name) return <span key={item + index} className="name"><span className={roletype[item[1]]}>{item[0]}</span></span>;
      return <span key={item + index} className={roletype[item[1]]}>{item[0]}</span>;
    }).filter(Boolean);
    roles = <div>{roles?.length ? roles : "　"}</div>;
    if (insane || sane) roles = <div className={insane ? "InsaneResult " : "SaneResult"}>{roles}</div>;
    if (important) roles = <div className="Important">{roles}</div>;
    return <div className="tableCell" id={`${dataField}_tableid_${row.id}`}>{roles}</div>;
  };

  const deathFormatter = (dataField) => (cell, row) => {
    if (!(dataField in row) || !isDeathEventLabel(row.name[0])) return cellFormatter(dataField)(cell, row);

    const items = row[dataField];
    const moveItems = [];
    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (items[index].length > 3 && items[index][2] === actionType.role) {
        const item = items[index][0] in roleImage ? <img className={roletype[items[index][1]]} src={roleImage[items[index][0]]} alt={items[index]} /> : items[index][0];
        const count = items.slice(0, index).filter((entry) => entry[2] === actionType.name).length - 1;
        moveItems.push(<MoveItem key={index} num={count} startId={`${dataField}_tableid_${row.id}`} endId={`deadRole_tableid_${items[index][3]}`} item={item} />);
        items.splice(index, 1);
      }
    }
    return <div className="tableCell">{cellFormatter(dataField)(cell, row)}{moveItems}</div>;
  };

  return { cellFormatter, deathFormatter };
};
