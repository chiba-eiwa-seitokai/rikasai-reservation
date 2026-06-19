/**
 * 入場システム 実証実験（6/19実施）アンケート用 Googleフォームを自動生成するスクリプト
 *
 * 【使い方】
 * 1. https://script.google.com/ にアクセスし、「新しいプロジェクト」を作成する
 * 2. デフォルトの Code.gs の内容を全て削除し、このファイルの内容を貼り付けて保存する
 * 3. 上部の関数選択ドロップダウンで createExperimentSurveyForm を選び、実行（▶）する
 * 4. 初回実行時は権限の許可画面が出るので「許可」する
 *    （このGoogleアカウントの下にフォームと集計用スプレッドシートが作成されます）
 * 5. 実行後、「表示」→「ログ」（または Ctrl+Enter）でフォームURLが確認できる
 * 6. 生成されたフォームはGoogleフォーム上で見た目の調整・QRコード化が可能
 *
 * 個人名・メールアドレスは収集しない設計（学年・組のみ、無記名アンケート）。
 */
function createExperimentSurveyForm() {
  const form = FormApp.create('入場システム 実証実験アンケート（6/19実施）')
    .setDescription(
      '6月19日（金）登校時に実施した入場システムの実証実験について、今後の改善のためアンケートにご協力ください（3分程度・無記名）。'
    )
    .setConfirmationMessage('回答ありがとうございました。')
    .setAllowResponseEdits(false)
    .setCollectEmail(false)
    .setIsQuiz(false);

  // 学年・クラス（個人名は聞かない。集計・分析用）
  form.addListItem()
    .setTitle('学年を選んでください')
    .setChoiceValues(['1年', '2年', '3年'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('クラスを入力してください（例：2-3）')
    .setRequired(true);

  // QRコードの事前準備
  form.addMultipleChoiceItem()
    .setTitle('事前にQRコードをスマホに保存できましたか？')
    .setChoiceValues([
      'スムーズにできた',
      '少し手間がかかったができた',
      'できなかった（当日その場で準備した）',
      'できなかった（準備できず手動確認になった）'
    ])
    .setRequired(true);

  // 手順のわかりやすさ
  form.addScaleItem()
    .setTitle('招待リンク発行〜QRコード保存までの手順は分かりやすかったですか？')
    .setBounds(1, 5)
    .setLabels('わかりにくかった', 'わかりやすかった')
    .setRequired(true);

  // 当日のチェックイン体感
  form.addScaleItem()
    .setTitle('当日のQRチェックイン（受付）はスムーズでしたか？')
    .setBounds(1, 5)
    .setLabels('スムーズではなかった', 'とてもスムーズだった')
    .setRequired(true);

  // 待ち時間
  form.addMultipleChoiceItem()
    .setTitle('チェックインの待ち時間はどうでしたか？')
    .setChoiceValues(['待たなかった', '少し待った（10秒程度）', 'かなり待った（30秒以上）'])
    .setRequired(true);

  // トラブルの有無・内容
  form.addMultipleChoiceItem()
    .setTitle('当日、何か困ったこと・トラブルはありましたか？')
    .setChoiceValues(['なかった', 'あった'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('困ったこと・トラブルの内容を教えてください（「あった」を選んだ方）')
    .setRequired(false);

  // 改善希望点（自由記述）
  form.addParagraphTextItem()
    .setTitle('梨花祭本番に向けて改善してほしい点があれば教えてください')
    .setRequired(false);

  // 総合満足度
  form.addScaleItem()
    .setTitle('システム全体への満足度を教えてください')
    .setBounds(1, 5)
    .setLabels('不満', '満足')
    .setRequired(true);

  // 回答を集計用スプレッドシートに自動連携
  const spreadsheet = SpreadsheetApp.create('入場システム実証実験アンケート_集計');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  Logger.log('回答用フォームURL: ' + form.getPublishedUrl());
  Logger.log('編集用URL: ' + form.getEditUrl());
  Logger.log('集計用スプレッドシート: ' + spreadsheet.getUrl());

  return form.getPublishedUrl();
}
