# Quality Foundation 後続作業ロードマップ

## 目的

`feature/quality-foundation` を、盤面状態の責務分離とテストの基盤を備えた統合基点として扱う。この文書は、このブランチへ直接追加する作業と、そこから派生させるべき作業を区別する。

現時点で、`feature/quality-foundation` には統合を止める未完了の実装作業はない。後続作業は目的ごとに小さな派生ブランチで進め、機能変更・依存関係更新・大規模リファクタリングを同一変更に混在させない。

## ブランチの位置付け

```text
feature/quality-foundation
├─ feature/quality-ci                 # 継続的な test/build 実行
├─ feature/quality-integration-tests  # 複数 UI をまたぐ回帰テスト
├─ chore/dependency-upgrade-plan       # 更新方針と互換性調査
├─ refactor/legacy-runtime-boundary    # legacyBoardRuntime の縮小・撤去
└─ feature/board-persistence           # 保存・共有を決めた後だけ作成
```

各派生ブランチは `feature/quality-foundation` の最新 HEAD から作成し、完了後に同ブランチへ戻す。品質基盤の安定化が完了してから `master` へ統合し、公開が必要な変更だけを `gh-pages` のリリース手順へ進める。

`feature/local-role-images-preview` はこの系列に含めない。暫定画像の利用条件が未確定であるため、[ローカル画像プレビューブランチの扱い](../policies/local-preview-branch-policy.md) に従う。

## 優先度 1: 継続的な検証

### `feature/quality-ci`

リポジトリには GitHub Actions workflow がないため、PR 前提の運用でも test/build がローカル確認だけに依存している。GitHub Actions を追加し、push と pull request で次を実行する。

1. `mise.toml` で固定している Node 24.14.0 を用意する。
2. `npm ci` で lockfile どおりに依存関係を復元する。
3. `CI=true npm test -- --watchAll=false` を実行する。
4. `npm run build` を実行する。

完了条件は、workflow が GitHub 上で成功し、`quality-foundation` と将来の `master` / `gh-pages` 向け ruleset に必要な status check として設定できる状態になることとする。ruleset の UI 設定変更はリポジトリ内の workflow 追加とは別に扱う。

**状態（2026-09-13）:** `Verify / test-and-build` の GitHub Actions 実行が成功した。workflow は `feature/quality-foundation` へ統合済みであり、ruleset の必須 status check 設定は必要な保護対象を決めた時点で行う。

### `feature/quality-integration-tests`

現在の reducer・純粋関数・個別 UI 部品のテストを補完し、複数 UI 部品をまたぐ回帰を自動化する。優先するシナリオは次のとおり。

- 名前変更後、行動・対象セルの候補が最新の参加者へ切り替わる。
- 色変更後、名前欄アイコン、行動・対象セル、ポップアップ snapshot が同じ色を参照する。
- リセット後、ポップアップが初期化後の盤面を表示する。
- 日付ヘッダーの昇順・降順ソートが、セル編集・翌日追加後も維持される。
- `RoleSelect` と `DeadSelect` の候補選択から reducer 更新までを、代表的な役職・イベントで確認する。

実装では、Root の統合テストを増やすか、外部依存を mock した画面レベルのテストを追加する。テーブル内部の実装詳細ではなく、利用者が観測できる値と callback の結果を検証対象とする。

## 優先度 2: 依存関係の更新方針

### `chore/dependency-upgrade-plan`

`package.json` の React 17、`react-scripts` 5、周辺ライブラリを対象に、更新前に互換性調査と移行順序を文書化する。特に Node 24.14.0、テスト基盤、Sass、GitHub Pages のビルド・デプロイへの影響を確認する。

このブランチでは依存パッケージを更新しない。次を決めるための調査・文書化だけを行う。

- `react-scripts` を維持する期間と、置換を検討する着手条件
- React と React DOM の更新可能な組み合わせ
- テストライブラリ、Sass、`gh-pages` の追従方針
- build 時の Node 非推奨警告と Browserslist 更新通知の原因・対応順

実際の更新は、依存グループごとに別ブランチへ分割する。各更新では `package-lock.json` を更新し、テスト・ビルド・ブラウザ確認を必須とする。

## 優先度 3: legacy 互換境界の縮小

### `refactor/legacy-runtime-boundary`

`legacyBoardRuntime` は既存の editor と formatter に、legacy タプル形式の getter を供給している。現時点では安定した互換境界として維持するが、state/model 層を UI の要求から独立させるため、将来的には撤去する。

着手前に優先度 1 の統合テストを整備する。作業は次の順に分ける。

1. editor と formatter が runtime から読んでいる値を列挙する。
2. 読み取り値を props または明示的な selector の契約へ置き換える。
3. `BoardTable`、列定義、editor から runtime getter を段階的に除去する。
4. runtime が不要になった時点で `legacyBoardRuntime` と関連する同期処理を削除する。

盤面データ形式の変換とは別のリファクタリングとして扱い、各段階でセル編集・色変更・候補更新・ポップアップの回帰を確認する。

## 着手条件つきの作業

### `feature/board-persistence`

盤面の保存・復元・共有、または legacy 形式では表せないドメイン機能を導入すると決めた場合にだけ作成する。その時点で [盤面データモデル](../design/domain-model.md) の `Board` と `BoardState.board` の相互変換、データのバージョン管理、既存盤面との互換性を設計する。

現時点では外部の盤面データを扱わないため、変換層だけを先行実装しない。

### 役職画像の正式対応

新役職画像は、素材の利用許諾・出典・公開条件が確定した後に、`master` から通常の機能ブランチを作成して扱う。`feature/local-role-images-preview` の画像参照コードや未追跡素材をこの系列へ統合しない。

## 共通の完了条件

派生ブランチでは、対象に応じて次を満たしてから `feature/quality-foundation` へ統合する。

- 関連する単体・統合テストが追加または更新され、`CI=true npm test -- --watchAll=false` が成功する。
- `npm run build` が成功する。
- DOM、セル編集、ポップアップ、依存関係に変更がある場合は、影響範囲をブラウザでも確認する。
- [盤面状態アーキテクチャ](../design/board-state-architecture.md) と [モジュール責務とディレクトリ設計](../design/module-directory-design.md) の責務境界を守る。
- 変更内容と確認結果を PR に記録する。
