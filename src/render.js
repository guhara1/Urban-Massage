const { site } = require('./config');

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const url = (path) => site.origin + (path.startsWith('/') ? path : '/' + path);

// ── 공통 헤더 내비 ──
function header() {
  const b = site.base;
  const links = [
    ['홈', `${b}/`],
    ['천안권', `${b}/cheonan/`],
    ['대전권', `${b}/daejeon/`],
    ['호남권', `${b}/honam/`],
    ['강원권', `${b}/gangwon/`],
    ['프로그램', `${b}/program/`],
    ['역·터미널', `${b}/station/`],
    ['이용 장소', `${b}/use/`],
    ['예약 전 확인', `${b}/check/`],
  ];
  return `<header class="site-header"><div class="container"><nav class="nav" aria-label="주 메뉴">
  <a class="brand" href="${b}/"><span class="dot" aria-hidden="true">G</span>${esc(site.brand)}</a>
  <button class="nav-toggle" aria-label="메뉴 열기" aria-expanded="false">☰</button>
  <div class="nav-links">${links.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div>
  <a class="btn btn-primary nav-cta" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a>
</nav></div></header>`;
}

// ── 텔레그램 아이콘 SVG ──
const tgIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.5c-.24 1.06-.87 1.32-1.76.82l-4.86-3.58-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.94 9.02-8.15c.39-.35-.09-.55-.61-.2L6.36 13.2l-4.79-1.5c-1.04-.32-1.06-1.04.22-1.54l18.73-7.22c.87-.32 1.63.2 1.35 1.36z"/></svg>`;

// ── 공통 푸터 ──
function footer() {
  const b = site.base;
  return `<footer class="site-footer"><div class="container">
  <div class="footer-top">
    <div class="footer-col">
      <div class="brand" style="margin-bottom:14px"><span class="dot" aria-hidden="true">G</span>${esc(site.brand)}</div>
      <p class="footer-biz"><strong>상호</strong> ${esc(site.brand)}<br>
      <a class="tel" href="tel:${site.tel}">📞 전화예약 ${esc(site.tel)}</a><br>
      <span class="muted">천안·대전·호남·강원 생활권 방문형 안내 사이트입니다.<br>불법·선정적 서비스는 제공하거나 안내하지 않습니다.</span></p>
      <div class="footer-cta">
        <a class="btn-tg" href="${site.telegram.web}" target="_blank" rel="noopener nofollow">${tgIcon}웹사이트 제작문의</a>
        <a class="btn-tg" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">${tgIcon}제휴문의</a>
      </div>
    </div>
    <div class="footer-col">
      <h4>권역 안내</h4>
      <ul>
        <li><a href="${b}/cheonan/">천안권 출장마사지</a></li>
        <li><a href="${b}/daejeon/">대전권 출장마사지</a></li>
        <li><a href="${b}/honam/">호남권 출장마사지</a></li>
        <li><a href="${b}/gangwon/">강원권 출장마사지</a></li>
        <li><a href="${b}/program/">마사지 프로그램</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>이용 안내</h4>
      <ul>
        <li><a href="${b}/use/">이용 장소</a></li>
        <li><a href="${b}/check/">예약 전 확인</a></li>
        <li><a href="${b}/check/privacy/">개인정보 처리</a></li>
        <li><a href="${b}/policy/">운영·이용 기준</a></li>
        <li><a href="${b}/about/">작성·검수 안내</a></li>
        <li><a href="${b}/contact/">문의하기</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© ${esc(site.brand)}. 천안·대전·호남·강원 생활권 안내.</span>
    <span>불법·선정적 서비스 불가 · 실제 주소·예약 조건 확인 후 안내</span>
  </div>
</div></footer>`;
}

// ── 모바일 전화 FAB (모든 페이지·모든 지역 노출) ──
function callFab() {
  return `<a class="call-fab" href="tel:${site.tel}" aria-label="전화 예약 걸기">
  <span class="fab-label">전화예약 ${esc(site.tel)}</span>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.5-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1z"/></svg>
</a>`;
}

// ── JSON-LD 스키마 빌더 ──
function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': url('/#organization'),
    name: site.brand,
    alternateName: site.brandEn,
    url: url(site.base + '/'),
    telephone: site.tel,
    areaServed: ['천안', '대전', '광주', '전주', '여수', '순천', '목포', '춘천', '원주', '강릉', '속초'],
    image: url(site.defaultOgImage),
  };
}

function buildSchema({ path, title, desc, breadcrumbs, faq, image }) {
  const graph = [organizationLd()];
  graph.push({
    '@type': 'WebPage',
    '@id': url(path) + '#webpage',
    url: url(path),
    name: title,
    description: desc,
    isPartOf: { '@id': url(site.base + '/') + '#website' },
    inLanguage: 'ko-KR',
    primaryImageOfPage: { '@id': url(path) + '#primaryimage' },
  });
  graph.push({
    '@type': 'WebSite',
    '@id': url(site.base + '/') + '#website',
    url: url(site.base + '/'),
    name: site.brand + ' · 중부·호남·강원 출장마사지 안내',
    inLanguage: 'ko-KR',
    publisher: { '@id': url('/#organization') },
  });
  graph.push({
    '@type': 'ImageObject',
    '@id': url(path) + '#primaryimage',
    url: url(image || site.defaultOgImage),
    contentUrl: url(image || site.defaultOgImage),
  });
  if (breadcrumbs && breadcrumbs.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': url(path) + '#breadcrumb',
      itemListElement: breadcrumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: url(c.path),
      })),
    });
  }
  if (faq && faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': url(path) + '#faq',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// ── 브레드크럼 HTML ──
function crumbsHtml(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length < 2) return '';
  return `<nav class="crumbs container" aria-label="위치">${breadcrumbs
    .map((c, i) =>
      i === breadcrumbs.length - 1
        ? `<span aria-current="page" style="color:var(--text-2);opacity:1">${esc(c.name)}</span>`
        : `<a href="${c.path}">${esc(c.name)}</a><span aria-hidden="true">›</span>`
    )
    .join('')}</nav>`;
}

// ── FAQ HTML ──
function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return `<section class="section"><div class="container"><h2>자주 묻는 질문</h2><div class="faq">${faq
    .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join('')}</div></div></section>`;
}

// desc 80자 이내 보장(안전장치)
function clampDesc(d) {
  d = (d || '').trim();
  return d.length <= 80 ? d : d.slice(0, 79).trim() + '…';
}

// ── 전체 레이아웃 ──
function layout({ path, title, desc, breadcrumbs, faq, body, image, noindex }) {
  desc = clampDesc(desc);
  const canonical = url(path);
  const og = url(image || site.defaultOgImage);
  const schema = buildSchema({ path, title, desc, breadcrumbs, faq, image });
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${site.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#070708">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="${site.base}/assets/css/tokens.css">
<link rel="stylesheet" href="${site.base}/assets/css/style.css">
<link rel="icon" href="${site.base}/assets/img/favicon.ico" sizes="48x48">
<link rel="icon" href="${site.base}/assets/img/favicon.svg" type="image/svg+xml" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${site.base}/assets/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="${site.base}/assets/img/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="${site.base}/assets/img/apple-touch-icon.png">
<link rel="manifest" href="${site.base}/assets/img/site.webmanifest">
<script type="application/ld+json">${schema}</script>
</head>
<body>
<a class="skip" href="#main">본문 바로가기</a>
${header()}
${crumbsHtml(breadcrumbs)}
<main id="main">
${body}
${faqHtml(faq)}
</main>
${footer()}
${callFab()}
<script src="${site.base}/assets/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = { layout, esc, url, clampDesc };
