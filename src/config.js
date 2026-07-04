// ── 간다GO · 중부·호남·강원권 출장마사지 안내 사이트 · 사이트 전역 설정 ──
// 실제 운영 값(텔레그램 핸들, 도메인 등)은 아래 상수만 수정하면 전 페이지에 반영됩니다.

const site = {
  brand: '간다GO',
  brandEn: 'GandaGO',
  // 사이트가 배포될 최종 도메인. schema/canonical/og 에 사용됩니다.
  origin: 'https://gandago.co.kr',
  // 사이트 루트 경로(서브디렉터리 배포 시 대비)
  base: '/central-honam-gangwon',
  tel: '0508-202-4719',
  telDigits: '0508-202-4719',
  // ⚠️ 텔레그램 핸들: 실제 계정으로 교체하세요.
  telegram: {
    web: 'https://t.me/gandago_web', // 웹사이트 제작문의
    partner: 'https://t.me/gandago_ad', // 제휴문의
  },
  defaultOgImage: '/central-honam-gangwon/assets/img/og-default.svg',
  locale: 'ko_KR',
  regionTag: '중부·호남·강원',
};

module.exports = { site };
