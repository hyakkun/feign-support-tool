# 盤面状態アーキテクチャ

## 目的

`index.js` に混在している盤面データ、色辞書、名前一覧、表示設定、ポップアップ送信を分離し、役職追加・UI改善・依存関係更新を安全にする。画面や既存の盤面保存形式を一度に置き換えない。

## 設計判断

- React の `BoardState` を可変状態の唯一の正本にする。
- `FeignTool_tableData`、`FeignTool_nameList`、`FeignTool_colorNameDic` のような可変モジュール変数は、段階移行後に廃止する。
- `react-bootstrap-table-next` が必要とする既存タプル形式は、当面 `BoardState` から導出する互換ビューとして維持する。
- 役職・イベント・結果などの不変設定は `boardConfig`、`roleCatalog`、`eventRows` に置く。`BoardState` には複製しない。
- ポップアップは別の状態を持たず、現在の `BoardState` から作ったスナップショットを受け取る。

## 状態の境界

```ts
type BoardState = {
  board: LegacyBoardRow[];       // 移行中の正本。将来は domain-model.md の Board へ変換する
  playerNames: string[];         // 入力順の参加者名。board から検証できるが編集操作に必要
  colorByPlayerName: Record<string, LegacyColor>;
  display: {
    playerIsIcon: boolean;
    nameIsIcon: boolean;
  };
  isTutorial: boolean;
  dayCount: number;
};

type LegacyBoardRow = {
  id: number;
  keyid: number;
  name: [string, number];
  color?: LegacyColor;
  role?: LegacyCellItem[];
  deadRole?: LegacyCellItem[];
  [dayField: `target_day${number}` | `action_day${number}`]: LegacyCellItem[];
};

type LegacyColor = [iconPath: string, hex: string];
type LegacyCellItem = [label: string, displayType: number, itemType: number, playerRowId?: number];
```

`colorByPlayerName` は `board` のプレイヤー行の `color` から再構築可能である。移行初期は既存 formatter との互換性を優先して保持し、色変更操作では `board` と辞書を同時に更新する。後段で `board` だけを正本にして selector で辞書を導出する。

## 操作

操作は reducer または同等の純粋関数として定義し、UI コンポーネントは操作を dispatch するだけにする。

| 操作 | 入力 | 主な更新 |
| --- | --- | --- |
| `setPlayerNames` | 改行入力または名前配列 | 参加者行の追加・削除・保持、選択肢更新 |
| `setPlayerColor` | 名前、色 | 該当プレイヤーの色、色辞書 |
| `updateCell` | 行 ID、日、列、セル値 | 盤面の一セル |
| `recordDeathRole` | 対象、役職、固定役職か | 死亡役職、アニメーション用トークン |
| `addDay` | なし | `dayCount` と日別列 |
| `addMemoRow` | なし | 新しいメモ行 |
| `resetBoard` | なし | 色を維持して役職・行動・メモを初期化 |
| `setDisplayOption` | 表示種別、真偽 | `display` のみ |

現在 `playerRows`、`eventRows`、`boardOperations` にある純粋関数は、これらの操作実装の基礎として再利用する。

## Selector と互換アダプター

React コンポーネントは可能な限り state 全体を受け取らず、次の selector を通じて必要な値を得る。

```ts
selectTableData(state): LegacyBoardRow[]
selectPlayerOptions(state): LegacyOption[]
selectColorByPlayerName(state): Record<string, LegacyColor>
selectColumns(state, formatters): TableColumn[]
selectPopupSnapshot(state, day): PopupSnapshot
```

既存テーブルへの入力は `selectTableData`、ポップアップ送信は `selectPopupSnapshot` を使う。これにより、テーブルライブラリを将来置き換えても reducer とドメイン操作を維持できる。

## コンポーネント境界

移行後の責務は次のように分ける。

```text
FeignSupportToolRoot
├─ BoardToolbar        : 翌日、メモ行、表示設定
├─ BoardTable          : テーブルライブラリとの互換アダプター
│  ├─ ColorSelect
│  ├─ InsaneSelect
│  ├─ RoleSelect
│  └─ DeadSelect
├─ NameInputPanel      : 名前入力、setName、リセット、補助表示起動
├─ MemoArea
└─ PopupBridge         : ポップアップへ snapshot を送信
```

`RoleSelect` と `DeadSelect` は state を直接変更しない。選択結果を `onUpdateCell`、死亡役職の結果を `onRecordDeathRole` で親へ通知する。これが完全なファイル分離の前提である。

## 段階的な移行

1. 現行テストを基準として `BoardState` と selector の型・仕様をテストで定義する。
2. `display` と `dayCount` を React state に寄せ、モジュール変数を読み取り専用にする。
3. `board`、`playerNames`、色辞書を `useReducer` へ移す。既存テーブルには selector の結果を渡す。
4. ポップアップ送信を `PopupBridge` へ分離する。
5. `NameInputPanel`、`RoleSelect`、`DeadSelect` を props 契約に沿って分離する。
6. legacy タプルと新しい `Board` モデルの変換関数を追加し、保存・テーブルを順に移行する。

各段階で `npm test`、`npm run build`、名前設定・役職入力・自爆/道連れ・ポップアップのブラウザ確認を行う。段階 3 以前にテーブルライブラリや React の更新を開始しない。

## 非目標

- ゲーム上の真偽、秘匿情報、視点別可視性を state に追加しない。
- 暫定画像を公開用 state や設定へ含めない。
- この移行で盤面データの永続化方式や GitHub Pages のデプロイ方式を変更しない。
