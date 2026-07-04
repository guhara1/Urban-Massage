// ── 지역 × 프로그램 롱테일 조합 페이지 ──
// 지시서 19절의 큐레이션된 고가치 조합만 생성(전수 매트릭스 금지 → 도어웨이 방지).
// 각 조합은 "왜 이 생활권에 이 프로그램이 맞는가"를 실제 지역 성격으로 고유하게 서술합니다.
// area 는 12대 생활권 slug.

const combos = [
  { area: 'cheonan-buldang-dujeong', program: 'swedish',
    angle: '불당·쌍용 신도시 오피스텔에는 출장·장기 체류자가 많아, 이동과 업무로 지친 몸을 강하게 누르기보다 부드럽게 풀어주는 릴렉스 수요가 큽니다. 첫 방문이나 수면 개선이 목적이라면 스웨디시 60·90분 코스가 부담이 적습니다.' },
  { area: 'cheonan-buldang-dujeong', program: 'aroma-therapy',
    angle: '천안아산역 환승과 업무로 긴장이 누적된 방문객에게는 향과 촉감으로 이완을 돕는 아로마테라피가 잘 맞습니다. 불당동 오피스텔·레지던스 체류 중 스트레스·불면 관리를 원할 때 자주 선택됩니다.' },
  { area: 'daejeon-dunsan-yuseong', program: 'sports-massage',
    angle: '둔산 업무지구의 장시간 좌식 근무와 유성 연구·대학 인력의 누적 피로가 겹쳐, 특정 근육군을 집중 관리하는 스포츠 마사지 문의가 많습니다. 반복 업무로 굳은 어깨·허리 회복에 적합합니다.' },
  { area: 'daejeon-dunsan-yuseong', program: 'foot-massage',
    angle: '정부청사·오피스가 밀집한 둔산과 호텔가 유성은 하루 종일 서고 걷는 일정이 많아, 발바닥 반사구와 종아리 순환을 풀어주는 발마사지가 컨디션 회복에 잘 맞습니다.' },
  { area: 'gwangju-sangmu-suwan', program: 'aroma-therapy',
    angle: '상무지구 비즈니스 숙소 체류객은 업무 스트레스 완화를 목적으로 아로마테라피를 자주 찾습니다. 향 중심의 부드러운 이완이 긴장·불면 관리에 도움이 됩니다.' },
  { area: 'gwangju-sangmu-suwan', program: 'swedish',
    angle: '수완·첨단 신도시의 오피스텔·아파트 이용객은 전신을 고르게 풀어주는 스웨디시 릴렉스를 선호합니다. 강한 압보다 순환과 이완이 필요할 때 적합합니다.' },
  { area: 'jeonju-wanju-innovation', program: 'thai-massage',
    angle: '전주혁신도시 이주 근무자는 새 근무 환경에서 누적된 자세 피로를 호소하는 경우가 많아, 스트레칭과 지압을 결합한 타이마사지가 잘 맞습니다.' },
  { area: 'jeonju-wanju-innovation', program: 'sports-massage',
    angle: '완주 산업권과 혁신도시 근무자의 근육 뭉침 회복 수요가 있어, 특정 부위를 집중 관리하는 스포츠 마사지 문의가 이어집니다.' },
  { area: 'yeosu-suncheon-gwangyang', program: 'foot-massage',
    angle: '여수·순천 관광 도보 이동과 광양 산단 근무로 발 피로가 큰 방문객이 많아, 발·종아리 순환을 풀어주는 발마사지가 특히 잘 맞습니다.' },
  { area: 'yeosu-suncheon-gwangyang', program: 'aroma-therapy',
    angle: '여수 해안 관광 숙소 체류객은 휴식과 심신 이완을 목적으로 아로마테라피를 자주 선택합니다. 여행 중 긴장을 낮추고 싶을 때 적합합니다.' },
  { area: 'chuncheon-hongcheon', program: 'sports-massage',
    angle: '춘천 역세권 출장객과 홍천 리조트 활동 방문객 모두 활동 후 근육 회복 수요가 있어, 뭉친 부위를 집중 관리하는 스포츠 마사지가 잘 맞습니다.' },
  { area: 'chuncheon-hongcheon', program: 'thai-massage',
    angle: '수도권에서 장거리 이동 후 춘천·홍천에 도착한 방문객의 뻐근함 해소에는 스트레칭 중심의 타이마사지가 적합합니다.' },
  { area: 'wonju-hoengseong', program: 'sports-massage',
    angle: '원주 혁신·기업도시 근무자의 반복 업무로 굳은 근육 관리 수요가 커, 부위별 집중 케어인 스포츠 마사지 문의가 많습니다.' },
  { area: 'wonju-hoengseong', program: 'thai-massage',
    angle: '무실 도심 오피스텔 체류객이 자세 피로와 뻐근함 해소를 원할 때, 스트레칭을 결합한 타이마사지가 잘 맞습니다.' },
  { area: 'gangneung-donghae-samcheok', program: 'aroma-therapy',
    angle: '경포·안목 해안 리조트 관광객은 휴식 중심의 아로마테라피를 선호합니다. 바다 여행 중 심신을 이완하고 싶을 때 적합합니다.' },
  { area: 'gangneung-donghae-samcheok', program: 'foot-massage',
    angle: '강릉역 도착 후 경포·안목 일대를 도보로 이동하는 관광객이 많아, 발 피로 회복에 발마사지가 잘 맞습니다.' },
  { area: 'sokcho-pyeongchang-resort', program: 'aroma-therapy',
    angle: '속초 해안 숙소와 평창 리조트 체류객 모두 여행 중 휴식·이완을 목적으로 아로마테라피를 자주 찾습니다.' },
  { area: 'sokcho-pyeongchang-resort', program: 'foot-massage',
    angle: '해변 도보 관광이나 스키·산악 활동 후 발과 종아리 피로가 큰 방문객에게 발마사지가 컨디션 회복에 잘 맞습니다.' },
  { area: 'sokcho-pyeongchang-resort', program: 'couple',
    angle: '리조트·펜션에 동반 여행으로 머무는 방문객이 많아, 두 분이 함께 이용하는 커플 관리 문의가 이어집니다. 객실 여건과 예약 가능 여부를 먼저 확인해야 합니다.' },
];

module.exports = { combos };
