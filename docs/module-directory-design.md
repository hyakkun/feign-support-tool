# モジュール責務とディレクトリ設計

## 目的

盤面の規則、状態遷移、テーブル表示、ポップアップ、アプリケーション起動を明確に分離し、各変更の影響範囲を限定する。

盤面状態と selector の設計は [`board-state-architecture.md`](board-state-architecture.md) を参照する。本書は、その設計を実装するモジュールの配置と依存関係を定義する。

## 依存関係の原則

- `src/index.js` は `react-scripts` が要求する固定の entry point とし、`app/bootstrap.js` を読み込むだけにする。
- `app/` は React の起動と各領域の組み立てを担当する。ゲーム規則、テーブル列、ポップアップ通信の詳細を持たない。
- `board/model/` は不変設定、初期データ、純粋なデータ変換を担当する。React、DOM、ポップアップに依存しない。
- `board/state/` は `BoardState`、reducer、操作、互換 runtime、盤面操作 hook を担当する。テーブルの描画実装に依存しない。
- `board/table/` は HTML table、列定義、formatter、editor を担当する。盤面更新は callback または state 層の公開 API を通じて行う。
- `board/popup/` は盤面 snapshot の送信とポップアップ window の管理を担当する。テーブル実装には依存しない。
- `components/` は盤面の表示形式に依存しない UI 部品を置く。状態は props と callback で受け取る。

依存は次の方向に限定する。矢印と逆向きの import は作らない。

```text
src/index.js ──> app
                  ├─ board/table ──> board/state ──> board/model
                  ├─ board/popup ──> board/state
                  └─ components
```

`board/table/` と `board/popup/` は、必要に応じて `board/model/` の純粋関数も利用できる。`board/state/` と `board/model/` から UI、DOM、popup へ依存することは避ける。

## ディレクトリ構成

テストファイルは実装ファイルに隣接して置く。以下のツリーでは `.test.js` を省略する。

```text
src/
├─ index.js                           # react-scripts 用の固定 entry point
├─ index.test.js                      # entry point を通す統合テスト
├─ setupTests.js                      # テスト共通設定
├─ app/
│  ├─ bootstrap.js                    # ReactDOM の起動と全体スタイルの読み込み
│  └─ FeignSupportToolRoot.js         # 状態・hook・画面部品の組み立て
├─ board/
│  ├─ model/
│  │  ├─ boardConfig.js               # 固定設定と legacy 設定の生成
│  │  ├─ roleCatalog.js               # 役職カタログ、陣営、表示名
│  │  ├─ roleOptionTokens.js          # 役職候補 token の生成
│  │  ├─ actionOptions.js             # 役職ごとの行動候補
│  │  ├─ eventRows.js                 # 固定イベント行と死亡イベント規則
│  │  ├─ playerRows.js                # 参加者行と参加者候補
│  │  └─ tutorialBoardData.js         # 固定チュートリアル盤面
│  ├─ state/
│  │  ├─ boardState.js                # BoardState の生成と selector
│  │  ├─ boardReducer.js              # 状態遷移
│  │  ├─ boardCommands.js             # reducer action creator
│  │  ├─ boardActionSequence.js       # 複合操作を action 列へ変換
│  │  ├─ boardOperations.js           # 盤面行・日付・リセットの純粋操作
│  │  ├─ legacyBoardRuntime.js        # legacy editor/formatter 用の互換境界
│  │  └─ hooks/
│  │     ├─ useBoardStateCommit.js    # reducer 反映と runtime 同期
│  │     ├─ useBoardToolbarActions.js # 翌日・メモ・表示設定
│  │     ├─ useBoardCellActions.js    # セル保存・色変更
│  │     └─ useNameBoardActions.js    # 名前設定・リセット
│  ├─ table/
│  │  ├─ BoardTable.js                # HTML table とセル編集状態
│  │  ├─ boardTableSetup.js           # テーブル構成の組み立て
│  │  ├─ boardTableFormatters.js      # legacy 値をテーブル表示へ変換
│  │  ├─ tableFormatters.js           # 汎用 formatter 部品
│  │  ├─ boardColumnSorts.js          # 列ソート規則
│  │  ├─ identityColumnDefinitions.js # 色・名前列
│  │  ├─ roleColumnDefinitions.js     # 役・死亡役職列
│  │  ├─ dayColumnDefinitions.js      # 日別の行動・対象列
│  │  └─ editors/
│  │     ├─ ColorSelect.js
│  │     ├─ InsaneSelect.js
│  │     ├─ RoleSelect.js
│  │     ├─ roleSelectState.js        # RoleSelect 専用の選択状態
│  │     └─ DeadSelect.js
│  └─ popup/
│     ├─ popupBridge.js               # snapshot の整形・postMessage
│     ├─ popupWindowController.js     # window.open と window 参照管理
│     └─ usePopupActions.js           # ポップアップ UI 操作 hook
├─ components/
│  ├─ NameInputPanel.js               # 名前入力・リセット・表示設定 UI
│  └─ MemoArea.js                     # 盤面外メモ UI
└─ styles/
   └─ index.scss                      # 全体スタイル
```

## 配置規約

- 新しいゲーム規則、固定行、役職定義、チュートリアルデータは `board/model/` に置く。
- `BoardState` の形、selector、reducer、盤面操作の純粋関数は `board/state/` に置く。Root から呼び出す盤面操作 hook は `board/state/hooks/` に置く。
- 列、セル表示、ソート、editor は `board/table/` に置く。特定 editor だけが使う補助状態は `board/table/editors/` に置く。
- 盤面 snapshot を使う別ウィンドウの機能は `board/popup/` に置く。
- 特定の盤面表示に依存しない UI 部品は `components/` に置く。
- 実装を追加・移動する際は対応するテストも同じディレクトリに置く。複数領域で共有するテストヘルパーが必要になった場合だけ `src/test/` を追加する。
- 新しい外部依存は、特定領域の都合だけで state/model 層へ持ち込まず、依存方向を保てる境界に配置する。
