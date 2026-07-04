# 간다GO · 중부·호남·강원 출장마사지 안내 사이트

천안·대전·호남·강원 생활권별 방문형 웰니스 **정보 안내** 정적 사이트입니다.
지역명만 바꾼 도어웨이 페이지가 아니라, 생활권·이용 장소·예약 전 확인 중심으로 구성했습니다.

## 구조

```
src/
  config.js        상호·전화·텔레그램·도메인 등 전역 설정
  data.js          4대 권역 · 12대 생활권 · 프로그램 · 이용/확인 페이지
  expand.js        시·군 도시 30개(천안2·대전5·호남12·강원11)
  expand-life.js   핵심 생활권(life) 25개
  expand-more.js   역·터미널 거점 23개 · 산업/관광 특화 use 16개
  render.js        레이아웃 · JSON-LD 스키마 · 헤더/푸터/전화 FAB
  blocks.js        Who·How·Why, 불법·선정 불가, 내부링크 블록
  build.js         정적 페이지 생성기
assets/            tokens.css(프리미엄 팔레트) · style.css · main.js
central-honam-gangwon/   생성된 사이트 (배포 대상, 총 156p)
```

## 페이지 구성 (156p, 전부 색인 대상)

| 구분 | 수 |
|---|---|
| 메인 · 권역(4) · 사이트맵/정책/문의 등 | 11 |
| 시·군 도시 (실제 콘텐츠) | 30 |
| 12대 광역 생활권 | 12 |
| 핵심 생활권(life) | 25 |
| 역·터미널 거점 + 인덱스 | 24 |
| 프로그램 + 인덱스 | 10 |
| 이용 장소 + 산업/관광 특화 | 29 |
| 예약 전 확인 + 인덱스 | 17 |

## 빌드

```bash
node src/build.js
```

`/central-honam-gangwon/` 하위에 전체 페이지와 `sitemap.xml`, `robots.txt`, 루트 리다이렉트가 생성됩니다.

## 반영된 요구사항

- **푸터 오렌지 텔레그램 버튼**: 웹사이트 제작문의 · 제휴문의 (`src/config.js`의 `telegram` 값 교체)
- **상호/전화**: 간다GO · 전화예약 0508-202-4719 (푸터·헤더·문의)
- **모바일 전화 FAB**: 모든 페이지·모든 지역, 오렌지 아이콘, 흔들림/펄스 애니메이션, 터치 시 전화 연결
- **메타 디스크립션 80자 이내** (전 페이지 자동 클램프)
- **스키마**: Organization · WebSite · WebPage · BreadcrumbList · FAQPage · ImageObject (JSON-LD `@graph`)
- **프리미엄 디자인 토큰 + 컴포넌트 오버레이** (`assets/css/tokens.css`)
- **내부링크**: 지역 ↔ 프로그램 ↔ 관련 지역 롱테일 연결
- **E-E-A-T / Who·How·Why / noindex 정책**: 얇은 행정구역 인덱스는 `noindex, follow`

## 배포 전 교체 필요

- `src/config.js` → `telegram.web`, `telegram.partner` 실제 텔레그램 핸들
- `src/config.js` → `origin` 실제 도메인
