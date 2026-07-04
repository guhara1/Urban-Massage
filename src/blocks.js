const { esc } = require('./render');
const { site } = require('./config');
const b = site.base;

// 프로그램 slug → 이름
function progName(slug, programs) {
  const p = programs.find((x) => x.slug === slug);
  return p ? p.name : slug;
}

// Who / How / Why 블록 (지역 맥락 반영)
function whoHowWhy(ctx) {
  const scope = ctx || '천안·대전·호남·강원';
  return `<section class="section"><div class="container prose-narrow article">
  <h2>Who · How · Why</h2>
  <p><strong>Who.</strong> 이 콘텐츠는 ${esc(scope)} 지역 방문형 웰니스 서비스 이용 전, 사용자가 위치·숙소 유형·건물 출입·예약 조건을 스스로 확인할 수 있도록 작성되었습니다. 각 지역의 행정구역, 주요 생활권, 교통 거점, 관광 숙소, 산업단지 기준을 바탕으로 페이지를 관리합니다.</p>
  <p><strong>How.</strong> 공식 행정구역 자료와 주요 생활권 구조, 실제 예약 전 확인 항목, 개인정보 처리 기준, 불법·선정적 서비스 불가 원칙을 기준으로 작성합니다. AI 보조 도구를 사용할 수 있으나 최종 문구는 사람이 검수하며 중복·과장·허위 표현을 제거합니다.</p>
  <p><strong>Why.</strong> 이 페이지의 목적은 검색 순위 조작이 아니라, 자택·호텔·오피스텔·펜션·리조트·산업단지 인접 숙소 이용 전 필요한 확인사항을 쉽게 안내하는 것입니다. 제공하지 않는 서비스나 불법·선정적 내용을 암시하지 않으며, 방문 가능 여부는 실제 주소와 예약 조건 확인 후 안내합니다.</p>
</div></section>`;
}

// 불법·선정 불가 + 개인정보 안내 (경량, 모든 주요 페이지)
function policyNote() {
  return `<div class="note warn"><strong>불법·선정적 서비스 불가.</strong> ${esc(site.brand)}는 불법·선정적 서비스를 제공하거나 안내하지 않습니다. 예약 확인과 연락에 필요한 최소 정보만 확인하며, 자세한 기준은 <a href="${b}/check/privacy/">개인정보 처리</a> 및 <a href="${b}/policy/">운영 기준</a> 페이지를 참고하세요.</div>`;
}

// 관련 지역/프로그램 내부링크
function relatedLinks(title, items) {
  if (!items.length) return '';
  return `<section class="section" style="padding-top:0"><div class="container">
  <h2>${esc(title)}</h2>
  <div class="linkwrap">${items.map((i) => `<a href="${i.path}">${esc(i.label)}</a>`).join('')}</div>
</div></section>`;
}

module.exports = { progName, whoHowWhy, policyNote, relatedLinks };
