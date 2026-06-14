const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });
  const ctx = await browser.newContext();

  // 1) 生徒向け手順 (A4 縦・@page 定義あり)
  {
    const page = await ctx.newPage();
    const f = 'file://' + path.resolve('docs/experiment_student_guide.html');
    await page.goto(f, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: 'docs/実証実験_生徒向け手順.pdf',
      printBackground: true,
      preferCSSPageSize: true,
    });
    await page.close();
    console.log('OK: 実証実験_生徒向け手順.pdf');
  }

  // 2) 説明会スライド (JSで1枚ずつ表示する設計 → 1枚ずつ描画して結合)
  {
    const { PDFDocument } = require('pdf-lib');
    const fs = require('fs');
    const page = await ctx.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    const f = 'file://' + path.resolve('docs/student_briefing_slides.html');
    await page.goto(f, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: `.nav, .controls, .pager, button, .hint, .counter, #bar { display: none !important; }` });
    const count = await page.$$eval('.slide', els => els.length);
    const merged = await PDFDocument.create();
    for (let i = 0; i < count; i++) {
      await page.evaluate((idx) => {
        document.querySelectorAll('.slide').forEach((el, j) => el.classList.toggle('active', j === idx));
      }, i);
      const buf = await page.pdf({ printBackground: true, width: '1280px', height: '720px', pageRanges: '1' });
      const sub = await PDFDocument.load(buf);
      const [pg] = await merged.copyPages(sub, [0]);
      merged.addPage(pg);
    }
    fs.writeFileSync('docs/実証実験_説明会スライド.pdf', await merged.save());
    await page.close();
    console.log('OK: 実証実験_説明会スライド.pdf (' + count + 'ページ)');
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
