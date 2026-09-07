import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import { Container } from "reactstrap";

class BoardTableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (Array.isArray(this.props.fallbackData)) {
        return <div><h1>大変申し訳ありません、エラーが発生しました</h1><button onClick={() => this.setState({ hasError: false })}>リトライ</button><div>{this.props.fallbackData.map((item, index) => <div key={index}>{JSON.stringify(item)}</div>)}</div></div>;
      }
      return <h1>大変申し訳ありません、エラーが発生しました</h1>;
    }
    return this.props.children;
  }
}

export const BoardTable = ({
  data,
  columns,
  tableKey,
  onCellSave,
  rowStyle,
  onAddMemo,
}) => (
  <Container style={{ whiteSpace: "nowrap", display: "flex", alignItems: "flex-end" }}>
    <BoardTableErrorBoundary fallbackData={data}>
      <BootstrapTable
        key={tableKey}
        data={data}
        columns={columns}
        keyField="keyid"
        bootstrap4={true}
        cellEdit={cellEditFactory({ mode: "click", blurToSave: true, afterSaveCell: onCellSave })}
        rowStyle={rowStyle}
      />
    </BoardTableErrorBoundary>
    <button onClick={onAddMemo} style={{ height: "fit-content" }}>メモ行追加</button>
  </Container>
);
