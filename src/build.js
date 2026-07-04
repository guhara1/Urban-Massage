const fs = require('fs');
const path = require('path');
const { site } = require('./config');
const { layout, esc, url } = require('./render');
const { whoHowWhy, policyNote, relatedLinks } = require('./blocks');
const { areas, regions, programs, usePages, checkPages } = require('./data');
const { cities } = require('./expand');
const { lifeAreas: lifeAreasA } = require('./expand-life');
const { lifeAreas: lifeAreasB } = require('./expand-life2');
const lifeAreas = [...lifeAreasA, ...lifeAreasB];
const { stations, useSpecial } = require('./expand-more');
const { combos } = require('./combos');

const ROOT = path.resolve(__dirname, '..');
const B = site.base; // /central-honam-gangwon
const routes = []; // for sitemap {path, priority, noindex}

// ── 유틸 ──
function out(routePath, html, { noindex = false, priority = 0.6 } = {}) {
  const dir = path.join(ROOT, routePath.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  routes.push({ path: routePath.endsWith('/') ? routePath : routePath + '/', priority, noindex });
}
const areaBy = (slug) => areas.find((a) => a.slug === slug);
const regionBy = (slug) => regions.find((r) => r.slug === slug);
const lifeBy = (slug) => lifeAreas.find((l) => l.slug === slug);
const allCities = Object.values(cities).flat();
const cityBy = (slug) => allCities.find((c) => c.slug === slug);
const homeCrumb = { name: '홈', path: `${B}/` };

// slug → 내부링크(라벨/경로) 해석: area · life · city · useSpecial 순
function resolveLink(slug) {
  const a = areaBy(slug);
  if (a) return { label: a.name, path: `${B}/area/${a.slug}/` };
  const l = lifeBy(slug);
  if (l) return { label: l.name, path: `${B}/life/${l.slug}/` };
  const c = cityBy(slug);
  if (c) return { label: c.name, path: `${B}/${findRegionOfCity(slug)}/${c.slug}/` };
  const u = useSpecial.find((x) => x.slug === slug);
  if (u) return { label: u.name, path: `${B}/use/${u.slug}/` };
  return null;
}
function findRegionOfCity(slug) {
  for (const [rk, list] of Object.entries(cities)) if (list.some((c) => c.slug === slug)) return rk;
  return '';
}
const progLinkOf = (slug) => {
  const pr = programs.find((x) => x.slug === slug);
  return pr ? { label: pr.name, path: `${B}/program/${pr.slug}/` } : null;
};

// ─────────────────────────────────────────────
// 1. 메인 페이지
// ─────────────────────────────────────────────
function buildHome() {
  const p = `${B}/`;
  const prices = [
    { t: '60분 코스', amt: '90,000', per: '60분', d: '기본 컨디션·릴렉스 케어', f: false },
    { t: '90분 코스', amt: '150,000', per: '90분', d: '아로마 포함 추천 구성', f: true },
    { t: '120분 코스', amt: '180,000', per: '120분', d: '전신 집중 프리미엄 케어', f: false },
  ];
  const areaCards = areas
    .map(
      (a) =>
        `<a class="card" href="${B}/area/${a.slug}/"><h3>${esc(a.name)}</h3><p>${esc(a.includes.slice(0, 4).join(' · '))}</p><span class="card-link">생활권 안내 →</span></a>`
    )
    .join('');
  const regionCards = regions
    .map(
      (r) =>
        `<a class="card" href="${B}/${r.slug}/"><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p><span class="card-link">권역 보기 →</span></a>`
    )
    .join('');
  const progCards = programs
    .map((pr) => `<a class="card" href="${B}/program/${pr.slug}/"><h3>${esc(pr.name)}</h3><p>${esc(pr.good)}</p></a>`)
    .join('');
  const useCards = usePages
    .map((u) => `<a class="card" href="${B}/use/${u.slug}/"><h3>${esc(u.name)}</h3></a>`)
    .join('');

  const faq = [
    { q: '천안·대전·호남·강원 전 지역 방문이 가능한가요?', a: '실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 기준, 숙소 유형을 확인한 뒤 안내합니다.' },
    { q: '대전은 어떤 구를 먼저 색인하나요?', a: '대전은 5개 구를 모두 포함하되, 서구 둔산·탄방과 유성·봉명, 대전역·원도심을 먼저 강화합니다.' },
    { q: '호남권은 광주·전남·전북을 모두 포함하나요?', a: '네. 최신 행정명(전남광주통합특별시)과 기존 검색명을 함께 반영해 광주·전주·여수·순천·목포로 찾을 수 있게 구성합니다.' },
    { q: '강원도는 어떤 페이지가 중요하나요?', a: '춘천·원주·강릉·속초 도시 페이지와 함께 평창·정선 리조트, 강릉·속초 해안 숙소, 펜션·외곽 이동 기준 페이지가 중요합니다.' },
    { q: '호텔이나 펜션에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 프런트 확인 방식, 예약자명, 야간 출입 가능 여부를 먼저 확인해야 합니다.' },
    { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
  ];

  const body = `
<section class="hero"><div class="container">
  <p class="eyebrow">중부·호남·강원 출장마사지 · 생활권 안내</p>
  <h1>천안·대전·호남·강원 출장마사지<br>생활권별 방문 가능 지역 안내</h1>
  <p class="lead">천안 불당, 대전 둔산·유성, 광주 상무, 전주, 여수, 춘천, 원주, 강릉, 속초 등 주요 생활권과 호텔·오피스텔·펜션·리조트 이용 전 확인사항을 안내합니다.</p>
  <div class="hero-cta">
    <a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a>
    <a class="btn btn-ghost btn-lg" href="${B}/program/">마사지 프로그램</a>
    <a class="btn btn-ghost btn-lg" href="${B}/check/">예약 전 확인</a>
  </div>
  <div class="chip-row">
    <a class="chip" href="${B}/cheonan/">천안권</a>
    <a class="chip" href="${B}/daejeon/">대전권</a>
    <a class="chip" href="${B}/honam/">호남권</a>
    <a class="chip" href="${B}/gangwon/">강원권</a>
    <a class="chip" href="${B}/area/cheonan-buldang-dujeong/">불당·두정</a>
    <a class="chip" href="${B}/area/daejeon-dunsan-yuseong/">둔산·유성</a>
    <a class="chip" href="${B}/area/gangneung-donghae-samcheok/">강릉·동해</a>
  </div>
</div></section>

<section class="section"><div class="container prose-narrow article">
  <h2>중부·호남·강원권은 지역마다 이용 기준이 다릅니다</h2>
  <p>천안은 충청 북부 교통·신도시 생활권, 대전은 광역시 도심·업무·유성 숙소권, 호남은 광주·전주·여수·순천·목포 중심 생활권, 강원은 관광 숙소·동해안·리조트·펜션 이동 기준이 중요합니다. 이 사이트는 단순 지역명 반복이 아니라 실제 이용 장소와 생활권을 기준으로 안내합니다.</p>
  ${policyNote()}
</div></section>

<section class="section" style="padding-top:0"><div class="container">
  <p class="eyebrow center">이용 코스와 요금 살펴보기</p>
  <h2 class="center">코스별 기준 요금 안내</h2>
  <p class="center muted" style="margin-bottom:26px">60·90·120분 코스별 기준 요금이며, 지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다.</p>
  <div class="price-grid">
    ${prices
      .map(
        (pr) => `<div class="card price ${pr.f ? 'is-featured' : ''}">${pr.f ? '<span class="badge">추천</span>' : ''}
      <h3>${esc(pr.t)}</h3>
      <div class="amt">${esc(pr.amt)}<small> 원</small></div>
      <div class="per">${esc(pr.per)}</div>
      <p class="muted">${esc(pr.d)}</p>
      <a class="btn btn-primary" href="tel:${site.tel}" style="margin-top:12px;justify-content:center">예약 문의</a></div>`
      )
      .join('')}
  </div>
</div></section>

<section class="section"><div class="container">
  <h2>권역별 안내</h2>
  <div class="grid grid-4">${regionCards}</div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
  <h2>12대 광역 생활권</h2>
  <p class="muted" style="margin-bottom:22px">지역명 반복이 아니라 생활권·이용 장소·예약 전 확인 중심으로 구성했습니다.</p>
  <div class="grid grid-3">${areaCards}</div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
  <h2>마사지 프로그램 안내</h2>
  <div class="grid grid-3">${progCards}</div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
  <h2>이용 장소별 확인 기준</h2>
  <div class="grid grid-4">${useCards}</div>
</div></section>
`;

  out(p, layout({
    path: p,
    title: '천안·대전·호남·강원 출장마사지｜광주·전주·춘천·원주 홈타이 안내',
    desc: '천안·대전·호남·강원 출장마사지 생활권과 호텔·오피스텔·펜션 이용 기준 안내.',
    breadcrumbs: [homeCrumb],
    faq,
    body,
  }), { priority: 1.0 });
}

// ─────────────────────────────────────────────
// 2. 권역 페이지
// ─────────────────────────────────────────────
function buildRegions() {
  regions.forEach((r) => {
    const p = `${B}/${r.slug}/`;
    const crumbs = [homeCrumb, { name: r.name, path: p }];
    const areaCards = r.areas
      .map((s) => areaBy(s))
      .filter(Boolean)
      .map(
        (a) => `<a class="card" href="${B}/area/${a.slug}/"><h3>${esc(a.name)}</h3><p>${esc(a.includes.slice(0, 5).join(' · '))}</p><span class="card-link">생활권 안내 →</span></a>`
      )
      .join('');
    const districtLinks = r.districts.map((d) => ({ label: d.name, path: `${B}/${r.slug}/${d.slug}/` }));
    const kw = r.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join('');

    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(r.name)}</p>
  <h1>${esc(r.h1)}</h1>
  <p class="lead">${esc(r.intro)}</p>
  <div class="chip-row">${kw}</div>
</div></section>

<section class="section" style="padding-top:0"><div class="container">
  <h2>핵심 생활권</h2>
  <div class="grid grid-3">${areaCards}</div>
</div></section>

${relatedLinks('시·군·구 도시 보기', districtLinks)}

<section class="section" style="padding-top:0"><div class="container prose-narrow article">
  ${policyNote()}
</div></section>

${whoHowWhy(r.name)}
`;
    out(p, layout({
      path: p, title: r.title, desc: r.desc, breadcrumbs: crumbs, body,
      faq: [
        { q: `${r.name}은 어떤 생활권을 다루나요?`, a: r.intro },
        { q: '방문 가능 여부는 어떻게 확인하나요?', a: '실제 주소, 가까운 생활권, 예약 가능 시간, 숙소 유형, 이동 기준을 확인한 뒤 안내합니다.' },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.9 });

    // 시·군 도시 페이지 (실제 콘텐츠 · 색인)
    (cities[r.slug] || []).forEach((c) => {
      const dp = `${B}/${r.slug}/${c.slug}/`;
      const dcr = [...crumbs, { name: c.name, path: dp }];
      const lifeSlugs = Array.from(new Set([...(c.life || []), ...lifeAreas.filter((l) => l.city === c.slug).map((l) => l.slug)]));
      const lifeLinks = lifeSlugs.map(resolveLink).filter(Boolean);
      const relCity = (c.related || []).map((s) => cityBy(s)).filter(Boolean).map((x) => ({ label: x.name, path: `${B}/${r.slug}/${x.slug}/` }));
      const progLinks = (c.programs || []).map(progLinkOf).filter(Boolean);
      const dbody = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(r.name)} · ${esc(c.name)}</p>
  <h1>${esc(c.h1)}</h1>
  <p class="lead">${esc(c.lead)}</p>
  <div class="hero-cta"><a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a><a class="btn btn-ghost btn-lg" href="${B}/check/">예약 전 확인</a></div>
</div></section>
<section class="section"><div class="container prose-narrow article">
  <h2>${esc(c.name)} 생활권 특징</h2>
  <p>${esc(c.feature)}</p>
  <h2>가까운 역·터미널·교통 거점</h2>
  <p>${esc(c.transport)}</p>
  <h2>숙소 유형별 이용 전 확인</h2>
  <p>${esc(c.stay)} 호텔·오피스텔·리조트는 프런트 확인, 예약자명, 객실·공동현관 출입 방식이 건물마다 다르므로 예약 시 함께 확인하세요.</p>
  <h2>마사지 프로그램 선택 기준</h2>
  <p>${esc(c.name)}에서는 ${(c.programs || []).map((s) => `<a href="${B}/program/${s}/">${esc((programs.find((x) => x.slug === s) || {}).name || s)}</a>`).join(', ')} 등을 자주 문의합니다. 목적에 맞춰 코스를 선택하세요.</p>
  <h2>예약 전 체크리스트</h2>
  <ul>
    <li>정확한 <a href="${B}/check/address/">주소·건물명</a> 확인</li>
    <li><a href="${B}/check/building-access/">건물 출입</a> 방식과 예약자명</li>
    <li>예약 가능 <a href="${B}/check/time/">시간대</a>와 이동 기준</li>
  </ul>
  ${policyNote()}
</div></section>
${lifeLinks.length ? relatedLinks('핵심 생활권 보기', lifeLinks) : ''}
${relatedLinks('자주 찾는 프로그램', progLinks)}
${relCity.length ? relatedLinks('인접 도시 보기', relCity) : ''}
${whoHowWhy(c.name)}`;
      out(dp, layout({
        path: dp, title: c.title, desc: c.desc, breadcrumbs: dcr, body: dbody,
        faq: [
          { q: `${c.name}은 어디까지 안내하나요?`, a: `${c.lead} 실제 주소·숙소 유형·예약 조건을 확인한 뒤 안내합니다.` },
          { q: '호텔·펜션에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 프런트 확인 방식, 예약자명, 야간 출입 가능 여부를 먼저 확인해야 합니다.' },
          { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
        ],
      }), { priority: 0.7 });
    });
  });
}

// ─────────────────────────────────────────────
// 3. 12대 생활권 상세 페이지
// ─────────────────────────────────────────────
function buildAreas() {
  areas.forEach((a) => {
    const p = `${B}/area/${a.slug}/`;
    const region = regionBy(a.region);
    const crumbs = [homeCrumb, { name: region.name, path: `${B}/${region.slug}/` }, { name: a.name, path: p }];
    const progLinks = a.programs.map((s) => {
      const pr = programs.find((x) => x.slug === s);
      return pr ? { label: pr.name, path: `${B}/program/${pr.slug}/` } : null;
    }).filter(Boolean);
    const relLinks = a.related.map((s) => {
      const r = areaBy(s);
      return r ? { label: r.name, path: `${B}/area/${r.slug}/` } : null;
    }).filter(Boolean);
    const comboLinks = combos
      .filter((cb) => cb.area === a.slug)
      .map((cb) => {
        const sp = programs.find((y) => y.slug === cb.program);
        return sp ? { label: `${a.name} ${sp.name}`, path: `${B}/area/${a.slug}/${sp.slug}/` } : null;
      })
      .filter(Boolean);

    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(region.name)} · 생활권 안내</p>
  <h1>${esc(a.h1)}</h1>
  <p class="lead">${esc(a.life)}</p>
  <div class="chip-row">${a.includes.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div>
  <div class="hero-cta">
    <a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a>
    <a class="btn btn-ghost btn-lg" href="${B}/check/">예약 전 확인</a>
  </div>
</div></section>

<section class="section"><div class="container prose-narrow article">
  <h2>이 지역의 생활권 특징</h2>
  <p>${esc(a.life)}</p>
  <h2>가까운 역·터미널·교통 거점</h2>
  <p>${esc(a.transport)}</p>
  <h2>호텔·숙소 이용 전 확인</h2>
  <p>호텔·비즈니스 숙소는 프런트 확인 방식과 예약자명, 객실 출입 가능 여부, 야간 출입 정책을 먼저 확인해야 합니다. ${esc(a.name)}는 관광·업무 수요가 겹치는 구간이므로 성수기·주말에는 이동 기준을 함께 확인하는 것이 좋습니다.</p>
  <h2>오피스텔 이용 전 확인</h2>
  <p>오피스텔은 공동현관 비밀번호나 카드키, 엘리베이터 보안, 동·호수 확인이 필요합니다. ${esc(a.includes.slice(0, 3).join('·'))} 일대 신축 오피스텔은 방문자 출입 절차가 건물마다 다르므로 예약 시 출입 방식을 함께 안내받으세요.</p>
  <h2>아파트·자택 이용 전 확인</h2>
  <p>아파트·자택은 정확한 동·호수와 공동현관 출입, 주차 가능 여부를 미리 확인합니다. 세대 방문은 실제 주소와 예약자명이 일치해야 안내가 가능합니다.</p>
  <h2>산업단지·혁신도시·관광 숙소 이동 기준</h2>
  <p>${esc(region.name)}은 산업단지·혁신도시·관광 숙소가 도심에서 떨어진 경우가 있어 이동 거리와 진입 동선을 먼저 확인해야 합니다. 이동 기준은 <a href="${B}/check/travel-fee/">이동 기준 안내</a>에서 확인할 수 있습니다.</p>
  <h2>마사지 프로그램 선택 기준</h2>
  <p>${esc(a.name)}에서는 ${a.programs.map((s) => `<a href="${B}/program/${s}/">${esc((programs.find((x) => x.slug === s) || {}).name || s)}</a>`).join(', ')} 등의 프로그램을 자주 문의합니다. 목적(릴렉스·근육 회복·스트레칭)에 맞춰 코스를 선택하세요.</p>
  <h2>예약 전 체크리스트</h2>
  <ul>
    <li>정확한 방문 <a href="${B}/check/address/">주소·건물명</a> 확인</li>
    <li>공동현관·엘리베이터 등 <a href="${B}/check/building-access/">건물 출입</a> 방식</li>
    <li>호텔·오피스텔·리조트별 <a href="${B}/check/hotel-policy/">출입 정책</a></li>
    <li>예약 가능 <a href="${B}/check/time/">시간대</a>와 이동 기준</li>
  </ul>
  <h2>개인정보 처리 기준</h2>
  <p>예약 확인과 연락에 필요한 최소 정보만 확인합니다. 자세한 내용은 <a href="${B}/check/privacy/">개인정보 처리</a> 페이지를 참고하세요.</p>
  ${policyNote()}
</div></section>

${relatedLinks('이 지역에서 자주 찾는 프로그램', progLinks)}
${comboLinks.length ? relatedLinks('생활권 × 프로그램 안내', comboLinks) : ''}
${relatedLinks('관련 지역 보기', relLinks)}

${whoHowWhy(a.name)}
`;
    const faq = [
      { q: `${a.name}은 어디까지 안내하나요?`, a: `${a.includes.join(', ')} 생활권을 중심으로 실제 주소·숙소 유형·예약 조건을 확인한 뒤 안내합니다.` },
      { q: '호텔·펜션에서도 이용할 수 있나요?', a: '숙소 정책, 객실 출입 가능 여부, 프런트 확인 방식, 예약자명, 야간 출입 가능 여부를 먼저 확인해야 합니다.' },
      { q: '개인정보는 어떻게 처리하나요?', a: '예약 확인과 연락에 필요한 최소 정보만 확인하며, 개인정보 처리 기준 페이지로 연결합니다.' },
      { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
    ];
    out(p, layout({ path: p, title: a.title, desc: a.desc, breadcrumbs: crumbs, faq, body }), { priority: 0.8 });
  });
}

// ─────────────────────────────────────────────
// 3-b. 핵심 생활권(life) 상세 페이지
// ─────────────────────────────────────────────
function buildLife() {
  lifeAreas.forEach((l) => {
    const p = `${B}/life/${l.slug}/`;
    const region = regionBy(l.region);
    const city = cityBy(l.city);
    const crumbs = [homeCrumb, { name: region.name, path: `${B}/${region.slug}/` }];
    if (city) crumbs.push({ name: city.name, path: `${B}/${region.slug}/${city.slug}/` });
    crumbs.push({ name: l.name, path: p });
    const progLinks = (l.programs || []).map(progLinkOf).filter(Boolean);
    const nearLinks = (l.nearby || []).map(resolveLink).filter(Boolean);
    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(region.name)}${city ? ' · ' + esc(city.name) : ''} · 생활권</p>
  <h1>${esc(l.name)} 출장마사지 · 생활권 안내</h1>
  <p class="lead">${esc(l.feature)}</p>
  <div class="hero-cta"><a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a><a class="btn btn-ghost btn-lg" href="${B}/check/">예약 전 확인</a></div>
</div></section>
<section class="section"><div class="container prose-narrow article">
  <h2>이 생활권의 특징</h2>
  <p>${esc(l.feature)}</p>
  <h2>가까운 역·터미널·교통 거점</h2>
  <p>${esc(l.transport)}</p>
  <h2>숙소 이용 전 확인</h2>
  <p>${esc(l.stay)} 호텔·오피스텔·리조트·펜션은 프런트 확인, 예약자명, 객실·공동현관 출입 방식이 다르므로 예약 시 함께 확인해야 합니다.</p>
  <h2>마사지 프로그램 선택 기준</h2>
  <p>${esc(l.name)}에서는 ${(l.programs || []).map((s) => `<a href="${B}/program/${s}/">${esc((programs.find((x) => x.slug === s) || {}).name || s)}</a>`).join(', ')} 등을 자주 문의합니다.</p>
  <h2>예약 전 체크리스트</h2>
  <ul>
    <li>정확한 <a href="${B}/check/address/">주소·건물명</a>과 예약자명</li>
    <li><a href="${B}/check/building-access/">건물 출입</a> 방식(공동현관·엘리베이터)</li>
    <li>예약 가능 <a href="${B}/check/time/">시간대</a>와 이동 기준</li>
  </ul>
  ${policyNote()}
</div></section>
${relatedLinks('자주 찾는 프로그램', progLinks)}
${nearLinks.length ? relatedLinks('인접 생활권 보기', nearLinks) : ''}
${whoHowWhy(l.name)}`;
    out(p, layout({
      path: p, title: l.title, desc: l.desc, breadcrumbs: crumbs, body,
      faq: [
        { q: `${l.name} 생활권은 어떤 곳인가요?`, a: l.feature },
        { q: '숙소 유형별로 무엇을 확인하나요?', a: '호텔·오피스텔·리조트·펜션마다 프런트 확인, 예약자명, 객실·공동현관 출입 방식이 다르므로 예약 시 함께 확인합니다.' },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.65 });
  });
}

// ─────────────────────────────────────────────
// 3-c. 역·터미널·KTX·SRT 거점 페이지
// ─────────────────────────────────────────────
function buildStations() {
  const sIndex = `${B}/station/`;
  const cardsByRegion = regions
    .map((r) => {
      const list = stations.filter((s) => s.region === r.slug);
      if (!list.length) return '';
      return `<h2>${esc(r.name)}</h2><div class="grid grid-4">${list
        .map((s) => `<a class="card" href="${B}/station/${s.slug}/"><h3>${esc(s.name)}</h3><p class="muted" style="font-size:.82rem">${esc(s.lines)}</p></a>`)
        .join('')}</div>`;
    })
    .join('');
  out(sIndex, layout({
    path: sIndex,
    title: '역·터미널 거점 안내｜KTX·SRT·고속버스 인접 숙소',
    desc: 'KTX·SRT·고속버스 역·터미널 거점별 인접 숙소 접근성 안내입니다.',
    breadcrumbs: [homeCrumb, { name: '역·터미널 거점', path: sIndex }],
    body: `<section class="section"><div class="container"><p class="eyebrow">역·터미널 거점</p><h1>역·터미널·KTX·SRT 거점 안내</h1><p class="lead">환승·출장 수요가 큰 역·터미널 거점별로 인접 숙소 접근성과 이동 동선을 안내합니다. 출구별·노선별 페이지는 제공하지 않습니다.</p></div></section><section class="section" style="padding-top:0"><div class="container">${cardsByRegion}</div></section>`,
  }), { priority: 0.6 });

  stations.forEach((s) => {
    const p = `${B}/station/${s.slug}/`;
    const region = regionBy(s.region);
    const crumbs = [homeCrumb, { name: region.name, path: `${B}/${region.slug}/` }, { name: '역·터미널', path: sIndex }, { name: s.name, path: p }];
    const progLinks = (s.programs || []).map(progLinkOf).filter(Boolean);
    const nearLinks = (s.nearby || []).map(resolveLink).filter(Boolean);
    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(region.name)} · 역·터미널 거점</p>
  <h1>${esc(s.name)} 출장마사지 · 거점 인접 숙소 안내</h1>
  <p class="lead">${esc(s.context)}</p>
  <div class="chip-row"><span class="chip">${esc(s.lines)}</span></div>
  <div class="hero-cta"><a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a><a class="btn btn-ghost btn-lg" href="${B}/check/">예약 전 확인</a></div>
</div></section>
<section class="section"><div class="container prose-narrow article">
  <h2>${esc(s.name)} 거점 특징</h2>
  <p>${esc(s.context)}</p>
  <h2>거점 인접 숙소 이용 전 확인</h2>
  <p>역·터미널 인접 비즈니스 숙소는 예약자명과 프런트 확인, 객실 출입 방식, 야간 출입 정책을 먼저 확인해야 합니다. 실제 방문 주소와 이동 동선을 확인한 뒤 안내합니다.</p>
  ${policyNote()}
</div></section>
${relatedLinks('자주 찾는 프로그램', progLinks)}
${nearLinks.length ? relatedLinks('가까운 생활권 보기', nearLinks) : ''}`;
    out(p, layout({
      path: p, title: s.title, desc: s.desc, breadcrumbs: crumbs, body,
      faq: [
        { q: `${s.name} 인접에서 이용할 수 있나요?`, a: `${s.context} 실제 주소와 숙소 유형, 이동 동선을 확인한 뒤 안내합니다.` },
        { q: '출구별·노선별 안내도 있나요?', a: '출구별·노선별 페이지는 제공하지 않으며, 거점 단위로 인접 숙소 접근성을 안내합니다.' },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.55 });
  });
}

// ─────────────────────────────────────────────
// 4. 프로그램
// ─────────────────────────────────────────────
function buildPrograms() {
  const pIndex = `${B}/program/`;
  const cards = programs
    .map((pr) => `<a class="card" href="${B}/program/${pr.slug}/"><h3>${esc(pr.name)}</h3><p>${esc(pr.good)}</p><span class="card-link">프로그램 안내 →</span></a>`)
    .join('');
  out(pIndex, layout({
    path: pIndex,
    title: '마사지 프로그램 안내｜스웨디시·타이·아로마·스포츠·발마사지',
    desc: '스웨디시·타이·아로마·스포츠·발마사지 등 프로그램별 특징과 선택 기준 안내.',
    breadcrumbs: [homeCrumb, { name: '마사지 프로그램', path: pIndex }],
    body: `<section class="section"><div class="container"><p class="eyebrow">마사지 프로그램</p><h1>마사지 프로그램 안내</h1><p class="lead">목적에 맞는 프로그램을 선택할 수 있도록 스웨디시·타이·아로마·스포츠·발마사지 등 주요 프로그램의 특징과 선택 기준을 안내합니다.</p></div></section><section class="section" style="padding-top:0"><div class="container"><div class="grid grid-3">${cards}</div></div></section>`,
  }), { priority: 0.7 });

  programs.forEach((pr) => {
    const p = `${B}/program/${pr.slug}/`;
    const crumbs = [homeCrumb, { name: '마사지 프로그램', path: pIndex }, { name: pr.name, path: p }];
    const areaLinks = pr.areas.map(resolveLink).filter(Boolean);
    const comboLinks = combos
      .filter((cb) => cb.program === pr.slug)
      .map((cb) => {
        const a = areaBy(cb.area);
        return a ? { label: `${a.name} ${pr.name}`, path: `${B}/area/${a.slug}/${pr.slug}/` } : null;
      })
      .filter(Boolean);
    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">마사지 프로그램</p>
  <h1>${esc(pr.name)} 안내</h1>
  <p class="lead">${esc(pr.intro)}</p>
  <div class="hero-cta"><a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a><a class="btn btn-ghost btn-lg" href="${B}/program/">다른 프로그램</a></div>
</div></section>
<section class="section" style="padding-top:0"><div class="container prose-narrow article">
  <h2>이런 분께 맞습니다</h2>
  <p>${esc(pr.good)}. 압의 세기와 소요 시간은 컨디션에 맞춰 조절하며, 첫 방문이라면 60·90분 코스로 부담 없이 시작하는 것을 권장합니다.</p>
  <h2>이용 전 확인</h2>
  <p>프로그램에 관계없이 실제 방문 주소, 숙소 유형, 건물 출입 방식, 예약 가능 시간대를 먼저 확인해야 합니다. <a href="${B}/check/">예약 전 확인</a> 페이지에서 항목을 확인하세요.</p>
  ${policyNote()}
</div></section>
${relatedLinks(`${pr.name}를 자주 찾는 지역`, areaLinks)}
${comboLinks.length ? relatedLinks(`지역별 ${pr.name} 안내`, comboLinks) : ''}
`;
    out(p, layout({
      path: p, title: pr.title, desc: pr.desc, breadcrumbs: crumbs, body,
      faq: [
        { q: `${pr.name}는 어떤 프로그램인가요?`, a: pr.intro },
        { q: '어디서 이용할 수 있나요?', a: '자택·호텔·오피스텔·리조트 등 숙소 유형과 실제 주소, 출입 방식을 확인한 뒤 안내합니다.' },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.7 });
  });
}

// ─────────────────────────────────────────────
// 4-b. 지역 × 프로그램 롱테일 조합 페이지
// ─────────────────────────────────────────────
function buildCombos() {
  combos.forEach((cb) => {
    const a = areaBy(cb.area);
    const pr = programs.find((x) => x.slug === cb.program);
    if (!a || !pr) return;
    const region = regionBy(a.region);
    const p = `${B}/area/${a.slug}/${pr.slug}/`;
    const crumbs = [
      homeCrumb,
      { name: region.name, path: `${B}/${region.slug}/` },
      { name: a.name, path: `${B}/area/${a.slug}/` },
      { name: pr.name, path: p },
    ];
    // 같은 생활권의 다른 조합(내부링크)
    const siblings = combos
      .filter((x) => x.area === cb.area && x.program !== cb.program)
      .map((x) => {
        const sp = programs.find((y) => y.slug === x.program);
        return sp ? { label: `${a.name} ${sp.name}`, path: `${B}/area/${a.slug}/${sp.slug}/` } : null;
      })
      .filter(Boolean);
    const title = `${a.name} ${pr.name}｜생활권 이용 안내`;
    const desc = `${a.name}에서 ${pr.name}를 찾을 때 참고할 생활권·숙소 이용 기준 안내.`;
    const body = `
<section class="section"><div class="container">
  <p class="eyebrow">${esc(region.name)} · ${esc(a.name)} · ${esc(pr.name)}</p>
  <h1>${esc(a.name)} ${esc(pr.name)} 안내</h1>
  <p class="lead">${esc(cb.angle)}</p>
  <div class="hero-cta"><a class="btn btn-primary btn-lg" href="tel:${site.tel}">전화예약 ${esc(site.tel)}</a><a class="btn btn-ghost btn-lg" href="${B}/area/${a.slug}/">${esc(a.name)} 생활권</a></div>
</div></section>
<section class="section"><div class="container prose-narrow article">
  <h2>${esc(a.name)}에서 ${esc(pr.name)}가 맞는 이유</h2>
  <p>${esc(cb.angle)}</p>
  <h2>${esc(pr.name)}는 어떤 프로그램인가요</h2>
  <p>${esc(pr.intro)} 자세한 내용은 <a href="${B}/program/${pr.slug}/">${esc(pr.name)} 프로그램 안내</a>에서 확인할 수 있습니다.</p>
  <h2>이 생활권 이용 전 확인</h2>
  <p>${esc(a.name)}는 ${esc(a.includes.slice(0, 4).join('·'))} 등 생활권으로 나뉘며, 숙소 유형과 건물 출입 방식이 구역마다 다릅니다. 방문 가능 여부는 실제 주소와 예약 조건을 확인한 뒤 안내합니다. 자세한 지역 정보는 <a href="${B}/area/${a.slug}/">${esc(a.name)} 안내</a>를 참고하세요.</p>
  <ul>
    <li>정확한 <a href="${B}/check/address/">주소·건물명</a>과 예약자명</li>
    <li><a href="${B}/check/building-access/">건물 출입</a> 방식과 예약 가능 <a href="${B}/check/time/">시간대</a></li>
  </ul>
  ${policyNote()}
</div></section>
${siblings.length ? relatedLinks(`${a.name}의 다른 프로그램`, siblings) : ''}
${relatedLinks('프로그램 · 지역 더 보기', [{ label: `${pr.name} 전체 안내`, path: `${B}/program/${pr.slug}/` }, { label: `${region.name} 안내`, path: `${B}/${region.slug}/` }])}`;
    out(p, layout({
      path: p, title, desc, breadcrumbs: crumbs, body,
      faq: [
        { q: `${a.name}에서 ${pr.name}를 이용할 수 있나요?`, a: `${cb.angle} 실제 주소·숙소 유형·예약 조건을 확인한 뒤 안내합니다.` },
        { q: '어디서 받을 수 있나요?', a: '자택·호텔·오피스텔·리조트 등 숙소 유형과 실제 주소, 건물 출입 방식을 확인한 뒤 안내합니다.' },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.55 });
  });
}

// ─────────────────────────────────────────────
// 5. 이용 장소 / 예약 전 확인 (인덱스 + 상세)
// ─────────────────────────────────────────────
function buildUseCheck() {
  // use index
  const useIndex = `${B}/use/`;
  out(useIndex, layout({
    path: useIndex,
    title: '이용 장소 안내｜자택·호텔·오피스텔·리조트 이용 기준',
    desc: '자택·호텔·오피스텔·아파트·리조트·펜션 등 이용 장소별 확인 기준 안내.',
    breadcrumbs: [homeCrumb, { name: '이용 장소', path: useIndex }],
    body: `<section class="section"><div class="container"><p class="eyebrow">이용 장소</p><h1>이용 장소별 확인 기준</h1><p class="lead">자택·호텔·오피스텔·아파트·리조트·펜션 등 이용 장소마다 출입 방식과 확인 항목이 다릅니다.</p></div></section>
<section class="section" style="padding-top:0"><div class="container"><h2>기본 이용 장소</h2><div class="grid grid-4">${usePages.map((u) => `<a class="card" href="${B}/use/${u.slug}/"><h3>${esc(u.name)}</h3></a>`).join('')}</div></div></section>
<section class="section" style="padding-top:0"><div class="container"><h2>산업단지·혁신도시 출장</h2><div class="grid grid-4">${useSpecial.filter((u) => u.kind === 'industry').map((u) => `<a class="card" href="${B}/use/${u.slug}/"><h3>${esc(u.name)}</h3></a>`).join('')}</div></div></section>
<section class="section" style="padding-top:0"><div class="container"><h2>강원 관광 숙소</h2><div class="grid grid-4">${useSpecial.filter((u) => u.kind === 'resort').map((u) => `<a class="card" href="${B}/use/${u.slug}/"><h3>${esc(u.name)}</h3></a>`).join('')}</div></div></section>`,
  }), { priority: 0.6 });
  // 산업/혁신/관광 특화 use 페이지
  useSpecial.forEach((u) => {
    const p = `${B}/use/${u.slug}/`;
    out(p, layout({
      path: p, title: u.title, desc: u.desc,
      breadcrumbs: [homeCrumb, { name: '이용 장소', path: useIndex }, { name: u.name, path: p }],
      body: `<section class="section"><div class="container"><p class="eyebrow">${u.kind === 'resort' ? '강원 관광 숙소' : '산업·혁신도시 출장'}</p><h1>${esc(u.name)} 안내</h1><p class="lead">${esc(u.desc)}</p></div></section><section class="section" style="padding-top:0"><div class="container prose-narrow article"><h2>이용 전 확인</h2><p>${esc(u.body)}</p><h2>예약 전 체크리스트</h2><ul><li>정확한 <a href="${B}/check/address/">주소·건물명</a>과 예약자명</li><li>${u.kind === 'resort' ? `<a href="${B}/check/resort-pension/">리조트·펜션 출입</a> 정책과 <a href="${B}/check/winter-road/">겨울철 도로</a>` : `<a href="${B}/check/industrial-area/">산업단지 이동</a> 기준과 야간 출입`} 확인</li><li>예약 가능 <a href="${B}/check/time/">시간대</a>와 이동 거리</li></ul>${policyNote()}</div></section>`,
      faq: [
        { q: `${u.name}은 어떻게 이용하나요?`, a: u.body },
        { q: '불법·선정적 서비스도 가능한가요?', a: '불법·선정적 서비스는 제공하거나 안내하지 않습니다.' },
      ],
    }), { priority: 0.5 });
  });
  usePages.forEach((u) => {
    const p = `${B}/use/${u.slug}/`;
    out(p, layout({
      path: p,
      title: `${u.name} 이용 안내｜예약 전 확인 기준`,
      desc: u.desc,
      breadcrumbs: [homeCrumb, { name: '이용 장소', path: useIndex }, { name: u.name, path: p }],
      body: `<section class="section"><div class="container"><p class="eyebrow">이용 장소</p><h1>${esc(u.name)} 이용 안내</h1><p class="lead">${esc(u.desc)}</p></div></section><section class="section" style="padding-top:0"><div class="container prose-narrow article"><h2>확인 항목</h2><ul><li>정확한 <a href="${B}/check/address/">주소·건물명</a></li><li><a href="${B}/check/building-access/">건물 출입</a> 방식(공동현관·엘리베이터)</li><li>예약자명과 <a href="${B}/check/time/">예약 시간</a></li><li>야간 이용 시 <a href="${B}/check/night-access/">야간 출입</a> 가능 여부</li></ul>${policyNote()}</div></section>`,
    }), { priority: 0.5 });
  });

  // check index
  const checkIndex = `${B}/check/`;
  out(checkIndex, layout({
    path: checkIndex,
    title: '예약 전 확인｜주소·출입·시간·개인정보 처리 기준',
    desc: '주소·건물 출입·예약 시간·이동·개인정보 등 예약 전 확인 항목 안내.',
    breadcrumbs: [homeCrumb, { name: '예약 전 확인', path: checkIndex }],
    body: `<section class="section"><div class="container"><p class="eyebrow">예약 전 확인</p><h1>예약 전 확인 항목</h1><p class="lead">방문 전 주소·건물 출입·예약 시간·이동 기준·개인정보 처리 항목을 미리 확인하면 안내가 빠릅니다.</p></div></section><section class="section" style="padding-top:0"><div class="container"><div class="grid grid-4">${checkPages.map((c) => `<a class="card" href="${B}/check/${c.slug}/"><h3>${esc(c.name)}</h3></a>`).join('')}</div></div></section>`,
  }), { priority: 0.7 });
  checkPages.forEach((c) => {
    const p = `${B}/check/${c.slug}/`;
    const noindex = c.slug === 'privacy' || c.slug === 'service-policy' ? false : false;
    out(p, layout({
      path: p,
      title: `${c.name}｜예약 전 확인 안내`,
      desc: c.desc,
      breadcrumbs: [homeCrumb, { name: '예약 전 확인', path: checkIndex }, { name: c.name, path: p }],
      body: `<section class="section"><div class="container"><p class="eyebrow">예약 전 확인</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.desc)}</p></div></section><section class="section" style="padding-top:0"><div class="container prose-narrow article"><p>정확한 정보 확인은 원활한 방문 안내의 기본입니다. 실제 주소와 예약 조건이 확인되어야 방문 가능 여부를 안내할 수 있으며, 불법·선정적 서비스는 제공하거나 안내하지 않습니다.</p>${policyNote()}</div></section>`,
      noindex,
    }), { priority: 0.5, noindex });
  });
}

// ─────────────────────────────────────────────
// 6. 운영 기준 / 작성·검수 / 문의 / 사이트맵
// ─────────────────────────────────────────────
function buildStatic() {
  const policyP = `${B}/policy/`;
  out(policyP, layout({
    path: policyP,
    title: '운영·이용 기준｜서비스 범위와 불법·선정 불가 원칙',
    desc: '제공 가능한 서비스 범위, 불법·선정 서비스 불가, 이용 원칙 등 운영 기준.',
    breadcrumbs: [homeCrumb, { name: '운영·이용 기준', path: policyP }],
    body: `<section class="section"><div class="container prose-narrow article"><p class="eyebrow">운영 기준</p><h1>운영·이용 기준</h1>
<h2>서비스 범위</h2><p>${esc(site.brand)}는 천안·대전·호남·강원 생활권의 방문형 웰니스 이용 전 확인사항을 안내하는 정보 사이트입니다. 방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.</p>
<h2>불법·선정적 서비스 불가</h2><p>불법·선정적 서비스는 제공하거나 안내하지 않으며, 관련 문의에는 응대하지 않습니다.</p>
<h2>행정명 안내</h2><p>호남권은 2026년 7월 1일 전남광주통합특별시 출범에 따라 새 행정명과 기존 검색명(광주·전남)을 함께 관리합니다. 강원권은 강원특별자치도 명칭을 함께 사용합니다.</p>
${policyNote()}</div></section>`,
  }), { priority: 0.4 });

  const aboutP = `${B}/about/`;
  out(aboutP, layout({
    path: aboutP,
    title: '작성·검수 안내｜콘텐츠 관리 기준',
    desc: '누가·어떻게·왜 만들었는지 밝히는 작성·검수 및 콘텐츠 관리 기준 안내.',
    breadcrumbs: [homeCrumb, { name: '작성·검수 안내', path: aboutP }],
    body: `<section class="section"><div class="container prose-narrow article"><p class="eyebrow">작성·검수</p><h1>작성·검수 안내</h1><p class="lead">이 사이트가 누구에 의해, 어떤 방식으로, 왜 만들어졌는지 밝힙니다.</p></div></section>${whoHowWhy('천안·대전·호남·강원')}`,
  }), { priority: 0.4 });

  const contactP = `${B}/contact/`;
  out(contactP, layout({
    path: contactP,
    title: '문의하기｜전화예약 및 제휴·제작 문의',
    desc: '간다GO 전화예약 0508-202-4719 및 제휴·웹사이트 제작 문의 안내.',
    breadcrumbs: [homeCrumb, { name: '문의하기', path: contactP }],
    body: `<section class="section"><div class="container prose-narrow article"><p class="eyebrow">문의하기</p><h1>문의하기</h1>
<div class="note"><strong>상호</strong> ${esc(site.brand)}<br><strong>전화예약</strong> <a href="tel:${site.tel}">${esc(site.tel)}</a></div>
<p>예약 문의는 전화로, 웹사이트 제작·제휴 문의는 아래 텔레그램으로 연락해 주세요.</p>
<div class="footer-cta"><a class="btn-tg" href="${site.telegram.web}" target="_blank" rel="noopener nofollow">웹사이트 제작문의</a><a class="btn-tg" href="${site.telegram.partner}" target="_blank" rel="noopener nofollow">제휴문의</a></div>
${policyNote()}</div></section>`,
  }), { priority: 0.5 });

  // HTML 사이트맵
  const smP = `${B}/sitemap/`;
  const group = (title, items) => `<h2>${esc(title)}</h2><div class="linkwrap">${items.map((i) => `<a href="${i.path}">${esc(i.label)}</a>`).join('')}</div>`;
  out(smP, layout({
    path: smP,
    title: '사이트맵｜전체 페이지 안내',
    desc: '천안·대전·호남·강원 출장마사지 안내 사이트 전체 페이지 사이트맵입니다.',
    breadcrumbs: [homeCrumb, { name: '사이트맵', path: smP }],
    body: `<section class="section"><div class="container article"><h1>사이트맵</h1>
${group('권역', regions.map((r) => ({ label: r.name, path: `${B}/${r.slug}/` })))}
${regions.map((r) => (cities[r.slug] && cities[r.slug].length) ? group(`${r.name} 시·군`, cities[r.slug].map((c) => ({ label: c.name, path: `${B}/${r.slug}/${c.slug}/` }))) : '').join('\n')}
${group('12대 생활권', areas.map((a) => ({ label: a.name, path: `${B}/area/${a.slug}/` })))}
${group('핵심 생활권', lifeAreas.map((l) => ({ label: l.name, path: `${B}/life/${l.slug}/` })))}
${group('역·터미널 거점', stations.map((s) => ({ label: s.name, path: `${B}/station/${s.slug}/` })))}
${group('프로그램', programs.map((p) => ({ label: p.name, path: `${B}/program/${p.slug}/` })))}
${group('지역 × 프로그램', combos.map((cb) => { const a = areaBy(cb.area); const pr = programs.find((x) => x.slug === cb.program); return { label: `${a.name} ${pr.name}`, path: `${B}/area/${a.slug}/${pr.slug}/` }; }))}
${group('이용 장소', usePages.map((u) => ({ label: u.name, path: `${B}/use/${u.slug}/` })))}
${group('산업·혁신·관광 숙소', useSpecial.map((u) => ({ label: u.name, path: `${B}/use/${u.slug}/` })))}
${group('예약 전 확인', checkPages.map((c) => ({ label: c.name, path: `${B}/check/${c.slug}/` })))}
${group('안내', [{ label: '운영 기준', path: `${B}/policy/` }, { label: '작성·검수', path: `${B}/about/` }, { label: '문의하기', path: `${B}/contact/` }])}
</div></section>`,
  }), { priority: 0.3 });
}

// ─────────────────────────────────────────────
// 7. 자산 복사 · 루트 리다이렉트 · robots · sitemap.xml
// ─────────────────────────────────────────────
function copyAssets() {
  const srcDir = path.join(ROOT, 'assets');
  const dstDir = path.join(ROOT, B.replace(/^\//, ''), 'assets');
  fs.cpSync(srcDir, dstDir, { recursive: true });
  // 이미지 자산(OG/파비콘) 생성
  const imgDir = path.join(dstDir, 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b1120"/><rect x="10" y="10" width="44" height="44" rx="12" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2b"/><stop offset="1" stop-color="#ff6a00"/></linearGradient></defs><text x="32" y="42" font-family="Pretendard,sans-serif" font-size="26" font-weight="800" fill="#fff" text-anchor="middle">G</text></svg>`;
  fs.writeFileSync(path.join(imgDir, 'favicon.svg'), favicon);
  const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e1626"/><stop offset="1" stop-color="#0b1120"/></linearGradient><linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a2b"/><stop offset="1" stop-color="#ff6a00"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1050" cy="90" r="260" fill="#ff7a18" opacity="0.12"/><rect x="90" y="240" width="70" height="70" rx="18" fill="url(#o)"/><text x="180" y="298" font-family="Pretendard,sans-serif" font-size="52" font-weight="800" fill="#fff">간다GO</text><text x="90" y="410" font-family="Pretendard,sans-serif" font-size="56" font-weight="800" fill="#eef2f9">천안·대전·호남·강원 출장마사지</text><text x="90" y="480" font-family="Pretendard,sans-serif" font-size="34" font-weight="600" fill="#c3cede">생활권별 방문 가능 지역 안내</text><text x="90" y="560" font-family="Pretendard,sans-serif" font-size="30" font-weight="700" fill="#ff9e3d">전화예약 0508-202-4719</text></svg>`;
  fs.writeFileSync(path.join(imgDir, 'og-default.svg'), og);
}

function buildRootAndSeo() {
  // 루트 → /central-honam-gangwon/ 리다이렉트
  const redirect = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>간다GO</title><link rel="canonical" href="${url(B + '/')}"><meta http-equiv="refresh" content="0; url=${B}/"><meta name="robots" content="noindex,follow"></head><body><a href="${B}/">중부·호남·강원 출장마사지 안내로 이동</a><script>location.replace('${B}/');</script></body></html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), redirect);

  // robots.txt
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url('/sitemap.xml')}\n`);

  // sitemap.xml (noindex 제외)
  const items = routes
    .filter((r) => !r.noindex)
    .map((r) => `  <url><loc>${url(r.path)}</loc><changefreq>weekly</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

// ─────────────────────────────────────────────
function run() {
  buildHome();
  buildRegions();
  buildAreas();
  buildLife();
  buildStations();
  buildPrograms();
  buildCombos();
  buildUseCheck();
  buildStatic();
  copyAssets();
  buildRootAndSeo();
  console.log(`✓ 생성 완료: ${routes.length} 페이지 (noindex ${routes.filter((r) => r.noindex).length})`);
}

run();
