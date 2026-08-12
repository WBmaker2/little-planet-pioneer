# 꼬마 행성 개척자

초등학생이 쉬는 시간에 즐길 수 있는 3D 전략·탐험 게임 프로토타입입니다.

## 게임 특징

- Three.js 저폴리 행성 탐험과 로버 이동
- 반짝이는 랜드마크 발견 미션
- 지원 로봇 선택과 능력 보너스
- 시설 배치, 생산 턴, 자원 관리
- WebGL 미지원 환경의 Phaser 2D 안전 모드
- 브라우저 로컬 저장 및 새로고침 재개

## 실행

```bash
pnpm install
pnpm run dev
```

기본 화면은 3D 모드입니다. 기존 2D 안전 모드는 다음 주소로 확인할 수 있습니다.

```text
http://localhost:5173/?renderer=2d
```

## 검증

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm test:e2e
pnpm run build
```

## 기술 메모

게임 규칙과 저장 상태는 `src/core`에 두고, Three.js 렌더링은 `src/render`, DOM HUD는 `src/ui3d`에서 담당합니다. 실제 GLB 자산이 없거나 로드되지 않는 경우에도 저폴리 프리미티브 폴백으로 플레이할 수 있습니다.
