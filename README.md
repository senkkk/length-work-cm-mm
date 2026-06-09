# ながさマスター cm・mm ワーク

小学2年生向けに、センチメートル（cm）とミリメートル（mm）の長さの概念を練習できる、依存関係なしの静的ブラウザ教材です。
画面上のものさしを見ながら、`1cm = 10mm` の関係をくり返し確認できます。

## 学べること

- ものさしの大きな目盛りを cm、小さな目盛りを mm として読む
- 「何cm何mm」の長さを、cm を省略した mm だけの表し方でも考える
- cm 単位の長さを mm に変換する
- mm 単位の長さを cm と mm に変換する
- 画面に表示された線や図形を本物のものさしで測り、cm と mm で答える

## 問題パターン

1. **目盛りを読む**  
   定規の赤いしるしを見て、何cm何mmかを答えます。画面の問いでは「mmだけなら何mmか」も確認できます。
2. **cm → mm**  
   表示された cm の長さを、`1cm = 10mm` を使って mm に変換します。
3. **mm → cm**  
   表示された mm の長さを、10mm のまとまりに分けて cm と mm に変換します。
4. **じっさいにはかる**
   画面に表示された線・棒・長方形などを本物のものさしで測って、何cm何mmかを答えます。最初に5cmのキャリブレーション線をものさしに合わせて「この大きさを一時保存」を押すと、そのブラウザのセッション中は同じ表示サイズで練習できます。読み取り誤差を考慮して、正解から1mm以内なら正解として判定します。

## ローカルでの確認

静的ファイルのみなので、ブラウザで `index.html` を開くだけでも動作します。
ローカルサーバーで確認する場合は次のように起動できます。

```bash
python3 -m http.server 8000
```

その後、ブラウザで <http://localhost:8000> を開いてください。

## GitHub Pages で公開する方法

このリポジトリには GitHub Actions 用のデプロイ設定（`.github/workflows/pages.yml`）を入れてあります。
`actions/deploy-pages` を使う場合、Pages の公開元をブランチではなく **GitHub Actions** にする必要があります。

1. GitHub のリポジトリ画面で **Settings** を開きます。
2. **Pages** を選びます。
3. **Build and deployment** の Source を **GitHub Actions** にします。
4. **Actions** タブで **Deploy static site to GitHub Pages** を開き、必要なら **Run workflow** を押します。
5. 反映後に表示される GitHub Pages の URL へアクセスすると教材を使えます。

### デプロイエラーになったとき

`Getting Pages deployment status failed` / `HttpError: Not Found` が出る場合は、まず次を確認してください。

- Settings > Pages > Build and deployment > Source が GitHub Actions になっている。
- GitHub Free の場合は、リポジトリが Public になっている。Private の GitHub Pages 公開には有料プランが必要です。
- Settings > Actions > General > Workflow permissions で、Actions が実行できる設定になっている。
- 初回設定直後は、Pages の設定を保存してから Actions を再実行する。
