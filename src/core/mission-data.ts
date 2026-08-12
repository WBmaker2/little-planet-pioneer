import type { ExplorationEvent, MissionDefinition, SupportRobot } from "./types";

export const events: ExplorationEvent[] = [
  {
    id: "cracked-cable",
    title: "갈라진 에너지 케이블",
    description: "관측 장비로 이어지는 케이블이 갈라져 있습니다.",
    choices: [
      { id: "cable-energy", label: "에너지로 즉시 수리", cost: { energy: 2 }, reward: {}, restorationDelta: 1 },
      { id: "cable-parts", label: "부품으로 보강", cost: { parts: 1 }, reward: { energy: 1 }, restorationDelta: 0 },
    ],
  },
  {
    id: "wandering-creatures",
    title: "이동 중인 외계 생명체",
    description: "작은 생명체 무리가 탐험 경로를 지나고 있습니다.",
    choices: [
      { id: "creatures-observe", label: "조용히 관찰", cost: { energy: 1 }, reward: {}, restorationDelta: 3 },
      { id: "creatures-detour", label: "물을 들고 우회", cost: { water: 1 }, reward: { parts: 1 }, restorationDelta: 1 },
    ],
  },
  {
    id: "sandstorm",
    title: "갑작스러운 모래폭풍",
    description: "붉은 모래가 기지 쪽으로 빠르게 다가옵니다.",
    choices: [
      { id: "storm-shelter", label: "임시 대피소 건설", cost: { parts: 2 }, reward: {}, restorationDelta: 1 },
      { id: "storm-return", label: "기지로 안전하게 귀환", cost: { energy: 1 }, reward: { water: 1 }, restorationDelta: 0 },
    ],
  },
  {
    id: "ice-pocket",
    title: "얼음 속 물주머니",
    description: "빙벽 안쪽에서 깨끗한 물 반응이 감지됩니다.",
    choices: [
      { id: "ice-melt", label: "에너지로 천천히 녹이기", cost: { energy: 2 }, reward: { water: 4 }, restorationDelta: 0 },
      { id: "ice-mark", label: "위치만 기록하기", cost: {}, reward: { water: 1 }, restorationDelta: 2 },
    ],
  },
  {
    id: "metal-deposit",
    title: "반짝이는 금속 광맥",
    description: "바위 사이에서 건설에 쓸 수 있는 금속이 보입니다.",
    choices: [
      { id: "metal-collect", label: "필요한 만큼 채집", cost: { energy: 1 }, reward: { parts: 3 }, restorationDelta: 0 },
      { id: "metal-scan", label: "광맥을 보존하고 스캔", cost: { energy: 1 }, reward: { parts: 1 }, restorationDelta: 2 },
    ],
  },
  {
    id: "glowing-seeds",
    title: "빛나는 씨앗",
    description: "어두운 흙 속에서 작은 씨앗이 빛나고 있습니다.",
    choices: [
      { id: "seeds-water", label: "물을 나누어 주기", cost: { water: 2 }, reward: {}, restorationDelta: 4 },
      { id: "seeds-carry", label: "온실로 옮기기", cost: { parts: 1 }, reward: { water: 1 }, restorationDelta: 2 },
    ],
  },
  {
    id: "old-probe",
    title: "오래된 탐사 장치",
    description: "먼저 온 탐사대의 장치가 모래에 묻혀 있습니다.",
    choices: [
      { id: "probe-repair", label: "부품으로 수리", cost: { parts: 2 }, reward: { energy: 3 }, restorationDelta: 1 },
      { id: "probe-recycle", label: "쓸 수 있는 부품 회수", cost: {}, reward: { parts: 2 }, restorationDelta: 0 },
    ],
  },
  {
    id: "frozen-bridge",
    title: "얼어붙은 다리",
    description: "얇은 얼음 다리가 다음 관측 지점으로 이어집니다.",
    choices: [
      { id: "bridge-reinforce", label: "부품으로 보강", cost: { parts: 2 }, reward: { water: 1 }, restorationDelta: 1 },
      { id: "bridge-route", label: "안전한 새 경로 찾기", cost: { energy: 2 }, reward: {}, restorationDelta: 2 },
    ],
  },
  {
    id: "mist-valley",
    title: "안개 계곡",
    description: "짙은 안개 때문에 지형 센서가 흔들립니다.",
    choices: [
      { id: "mist-beacon", label: "신호기 설치", cost: { parts: 1, energy: 1 }, reward: {}, restorationDelta: 2 },
      { id: "mist-wait", label: "물을 아끼며 기다리기", cost: { water: 1 }, reward: { energy: 1 }, restorationDelta: 0 },
    ],
  },
  {
    id: "forest-stream",
    title: "숲속의 작은 물길",
    description: "식물 사이로 맑은 물길이 흐르고 있습니다.",
    choices: [
      { id: "stream-filter", label: "간이 필터 설치", cost: { parts: 1 }, reward: { water: 3 }, restorationDelta: 2 },
      { id: "stream-protect", label: "주변을 보호 구역으로 지정", cost: { energy: 1 }, reward: { water: 1 }, restorationDelta: 4 },
    ],
  },
  {
    id: "solar-bloom",
    title: "태양을 따라 피는 꽃",
    description: "꽃잎이 태양의 방향으로 천천히 움직입니다.",
    choices: [
      { id: "bloom-study", label: "에너지 흐름 연구", cost: { energy: 1 }, reward: { energy: 2 }, restorationDelta: 2 },
      { id: "bloom-water", label: "물을 주고 군락 확장", cost: { water: 2 }, reward: {}, restorationDelta: 5 },
    ],
  },
  {
    id: "echo-cave",
    title: "메아리 동굴",
    description: "동굴 안쪽에서 규칙적인 기계음이 들립니다.",
    choices: [
      { id: "cave-explore", label: "조명으로 내부 탐사", cost: { energy: 2 }, reward: { parts: 3 }, restorationDelta: 1 },
      { id: "cave-map", label: "입구에서 지형만 기록", cost: { energy: 1 }, reward: { parts: 1 }, restorationDelta: 2 },
    ],
  },
];

export const supportRobots: SupportRobot[] = [
  { id: "waterdrop", title: "물방울", description: "시작 자원 물 +2" },
  { id: "spark", title: "반짝이", description: "태양광 생산 에너지 +1" },
  { id: "tick", title: "똑딱이", description: "첫 사건 보너스 부품 +1" },
  { id: "sprout", title: "새싹이", description: "온실 회복도 +2" },
];

const allBuildings = ["solar", "recycler", "workshop", "greenhouse", "observatory", "beacon"] as const;

export const missions: MissionDefinition[] = [
  { id: "plain-01", biome: "plain", duration: 3, title: "첫 태양빛", initialResources: { water: 6, energy: 5, parts: 5 }, target: { buildingType: "solar", count: 1 }, events: [events[0]], availableBuildings: ["solar", "beacon"], rewardCredits: 20 },
  { id: "plain-02", biome: "plain", duration: 5, title: "메마른 착륙지", initialResources: { water: 7, energy: 6, parts: 6 }, target: { buildingType: "recycler", count: 1 }, events: [events[1], events[2]], availableBuildings: ["solar", "recycler", "beacon"], rewardCredits: 30 },
  { id: "plain-03", biome: "plain", duration: 10, title: "관측소의 신호", initialResources: { water: 8, energy: 8, parts: 8 }, target: { buildingType: "observatory", count: 1 }, events: [events[0], events[4], events[6]], availableBuildings: ["solar", "workshop", "observatory", "beacon"], rewardCredits: 45 },
  { id: "plain-04", biome: "plain", duration: 10, title: "평원의 연결망", initialResources: { water: 9, energy: 9, parts: 9 }, target: { buildingType: "beacon", count: 2 }, events: [events[2], events[4], events[8]], availableBuildings: ["solar", "recycler", "workshop", "beacon"], rewardCredits: 50 },
  { id: "plain-05", biome: "plain", duration: 15, title: "첫 번째 개척 기지", initialResources: { water: 12, energy: 12, parts: 12 }, target: { buildingType: "greenhouse", count: 2 }, events: [events[1], events[5], events[6], events[11]], availableBuildings: [...allBuildings], rewardCredits: 70 },
  { id: "glacier-01", biome: "glacier", duration: 3, title: "얼음 아래의 물", initialResources: { water: 4, energy: 7, parts: 5 }, target: { buildingType: "recycler", count: 1 }, events: [events[3]], availableBuildings: ["solar", "recycler", "beacon"], rewardCredits: 25 },
  { id: "glacier-02", biome: "glacier", duration: 5, title: "빙하의 안전로", initialResources: { water: 6, energy: 8, parts: 6 }, target: { buildingType: "beacon", count: 1 }, events: [events[3], events[7]], availableBuildings: ["recycler", "workshop", "beacon"], rewardCredits: 35 },
  { id: "glacier-03", biome: "glacier", duration: 10, title: "얼어붙은 연구소", initialResources: { water: 7, energy: 10, parts: 8 }, target: { buildingType: "observatory", count: 1 }, events: [events[0], events[3], events[7]], availableBuildings: ["solar", "recycler", "workshop", "observatory"], rewardCredits: 50 },
  { id: "glacier-04", biome: "glacier", duration: 10, title: "안개 너머의 기지", initialResources: { water: 8, energy: 10, parts: 9 }, target: { buildingType: "beacon", count: 2 }, events: [events[7], events[8], events[11]], availableBuildings: ["recycler", "workshop", "observatory", "beacon"], rewardCredits: 55 },
  { id: "glacier-05", biome: "glacier", duration: 15, title: "푸른 빙하 정착지", initialResources: { water: 10, energy: 14, parts: 12 }, target: { buildingType: "greenhouse", count: 2 }, events: [events[3], events[7], events[8], events[10]], availableBuildings: [...allBuildings], rewardCredits: 75 },
  { id: "forest-01", biome: "forest", duration: 3, title: "빛나는 새싹", initialResources: { water: 7, energy: 5, parts: 4 }, target: { buildingType: "greenhouse", count: 1 }, events: [events[5]], availableBuildings: ["recycler", "greenhouse", "beacon"], rewardCredits: 25 },
  { id: "forest-02", biome: "forest", duration: 5, title: "작은 물길 보호", initialResources: { water: 8, energy: 6, parts: 5 }, target: { buildingType: "recycler", count: 1 }, events: [events[5], events[9]], availableBuildings: ["recycler", "greenhouse", "beacon"], rewardCredits: 35 },
  { id: "forest-03", biome: "forest", duration: 10, title: "태양꽃 연구", initialResources: { water: 9, energy: 8, parts: 7 }, target: { buildingType: "observatory", count: 1 }, events: [events[1], events[9], events[10]], availableBuildings: ["solar", "recycler", "greenhouse", "observatory"], rewardCredits: 50 },
  { id: "forest-04", biome: "forest", duration: 10, title: "숲의 통신망", initialResources: { water: 10, energy: 9, parts: 8 }, target: { buildingType: "beacon", count: 2 }, events: [events[5], events[8], events[9]], availableBuildings: ["solar", "greenhouse", "observatory", "beacon"], rewardCredits: 55 },
  { id: "forest-05", biome: "forest", duration: 15, title: "빛나는 숲의 도시", initialResources: { water: 14, energy: 12, parts: 12 }, target: { buildingType: "greenhouse", count: 3 }, events: [events[1], events[5], events[9], events[10]], availableBuildings: [...allBuildings], rewardCredits: 80 },
];
