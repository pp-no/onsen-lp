# 温泉旅行用LP（デモ）

このプロジェクトは **HTML / CSS / jQuery だけ** で構築された温泉旅行向けランディングページ（LP）のデモです。  
宿泊プラン紹介・アクセス情報・予約フォーム・SNSシェア機能など、旅行予約サイトの基本要素をまとめています。  
ビルドやフレームワークは不要で、そのままブラウザで表示可能です。

---

## 主な特徴

- **静的構成**：HTML / CSS / jQuery のみで動作
- **SEO / OGP対応**
  - `<title>` / `<meta name="description">` / `<link rel="canonical">`
  - OGP（`og:title`, `og:description`, `og:image` など）
- **UIセクション**
  - ヒーロー（KV・キャッチコピー・予約CTA）
  - プラン紹介（カップル / 子連れ / 女子旅）
  - アクセス（住所・地図リンク・送迎案内）
  - 予約フォーム（HTML5バリデーション＋jQuery）
  - SNSシェア（X, Facebook, LINE, URLコピー）
  - フッター（会社情報・法的リンク）
- **アクセシビリティ対応**
  - スキップリンク（本文へ移動）
  - `aria-label` / `role` / `aria-live` の適用
- **軽量**
  - jQueryのみをCDN経由で利用
  - 画像は `placehold.co` を使用（任意で差し替え可能）

---

