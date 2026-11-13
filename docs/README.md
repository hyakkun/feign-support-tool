# ドキュメント索引

このディレクトリでは、恒久的な設計、作業計画・調査記録、運用ポリシーを分けて管理する。

## 設計 (`design/`)

- [盤面状態アーキテクチャ](design/board-state-architecture.md): `BoardState`、操作、selector、互換境界、テスト方針。
- [盤面データモデル](design/domain-model.md): legacy タプル形式と将来の `Board` モデル、役職・イベントの表現。
- [モジュール責務とディレクトリ設計](design/module-directory-design.md): モジュール配置、依存方向、配置規約。

## 計画・調査記録 (`plans/`)

- [Quality Foundation 後続作業ロードマップ](plans/quality-foundation-roadmap.md): 派生ブランチ、優先度、着手条件、完了条件。
- [依存関係更新計画](plans/dependency-upgrade-plan.md): 調査結果、更新順序、互換性確認、Vite / Vitest への移行記録。
- [公開版差分の調査記録](plans/published-version-analysis.md): 回復フェーズでの公開版との差分調査。現行仕様ではなく、判断の背景資料として参照する。

## ポリシー (`policies/`)

- [役職画像の管理方針](policies/role-image-policy.md): 役職画像の配置、コードとの同時管理、外部素材の確認事項。

設計変更は `design/`、実施順・分岐・調査結果は `plans/`、継続的に守る運用ルールは `policies/` に置く。
