export type Project = {
  index: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
};

export const fallbackProjects: Project[] = [
  {
    index: '01',
    title: 'MagiskOnWSA',
    desc: 'Windows Subsystem for Android에 Magisk 루트와 Google Apps 통합',
    tags: ['Android', 'WSA', 'Magisk'],
    href: 'https://github.com/ruk13xa/MagiskOnWSA',
  },
  {
    index: '02',
    title: 'boj-extended',
    desc: '백준 온라인 저지 확장 기능 브라우저 익스텐션',
    tags: ['Chrome Extension', 'PS Tool'],
    href: 'https://github.com/ruk13xa/boj-extended',
  },
  {
    index: '03',
    title: 'ruka.my',
    desc: '개인 웹사이트 소스',
    tags: ['Personal Site'],
    href: 'https://github.com/ruk13xa/ruka.my',
  },
  {
    index: '04',
    title: 'BOJ',
    desc: '알고리즘 문제풀이 저장소',
    tags: ['Problem Solving', 'Algorithms'],
    href: 'https://github.com/ruk13xa/BOJ',
  },
  {
    index: '05',
    title: '햄스터봇 글래디에이터',
    desc: '확장 쉴드와 서보 모터를 결합한 로봇 배틀 게임 기획 — 센서 기반 특수 효과와 경기장 기믹을 포함한 교육용 로봇 배틀 디자인',
    tags: ['Hamster Robot', 'Servo Motor', 'Game Design', 'Entry/Python'],
    href: 'https://claude.ai/share/9d5dc919-47b7-4f16-a6ec-c0c1cfb4e99c',
  },
];

export const skillGroups = [
  {
    title: 'DESIGN',
    items: [
      { name: 'Figma', level: 'EXPERT' },
      { name: 'Motion Design', level: 'ADVANCED' },
      { name: 'Design Systems', level: 'EXPERT' },
      { name: '3D / WebGL', level: 'MID' },
    ],
  },
  {
    title: 'ENGINEERING',
    items: [
      { name: 'React / Next.js', level: 'EXPERT' },
      { name: 'TypeScript', level: 'ADVANCED' },
      { name: 'Three.js', level: 'MID' },
      { name: 'GLSL', level: 'MID' },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { name: 'Framer', level: 'ADVANCED' },
      { name: 'After Effects', level: 'ADVANCED' },
      { name: 'Blender', level: 'MID' },
      { name: 'Claude / AI Tools', level: 'EXPERT' },
    ],
  },
];

export const timeline = [{ period: '---', role: '---', org: '---', desc: '---' }];

export const sectionIds = ['about', 'work', 'skills', 'timeline', 'contact'] as const;
