import { sections, type ProfileSection } from '../profile/profile';

// Geometry for the 420 x 780 guitar. Every string runs from its tuner post,
// over the nut at NUT_Y, to the bridge at BRIDGE_Y. Values come from
// docs/design/guitar-nav-design.html.
export const NUT_Y = 150;
export const BRIDGE_Y = 655;
const BODY_CONTROL_Y = 402.5;

type StringGeometry = {
  index: number;
  postX: number;
  postY: number;
  buttonX: number;
  shaftEndX: number;
  nutX: number;
  bridgeX: number;
  gauge: number;
};

const GEOMETRY: readonly StringGeometry[] = [
  { index: 1, postX: 196, postY: 70, buttonX: 160, shaftEndX: 181, nutX: 206.6, bridgeX: 205.2, gauge: 1.2 },
  { index: 2, postX: 196, postY: 95, buttonX: 160, shaftEndX: 184, nutX: 199.8, bridgeX: 195.6, gauge: 1.25 },
  { index: 3, postX: 196, postY: 120, buttonX: 160, shaftEndX: 186, nutX: 193, bridgeX: 186, gauge: 1.4 },
  { index: 4, postX: 224, postY: 70, buttonX: 260, shaftEndX: 239, nutX: 213.4, bridgeX: 214.8, gauge: 1 },
  { index: 5, postX: 224, postY: 95, buttonX: 260, shaftEndX: 236, nutX: 220.2, bridgeX: 224.4, gauge: 0.85 },
  { index: 6, postX: 224, postY: 120, buttonX: 260, shaftEndX: 234, nutX: 227, bridgeX: 234, gauge: 0.7 },
];

// Label baselines for the three rows on each side of the headstock.
const LABEL_ROWS: readonly number[] = [72, 97, 122];

export type GuitarString = StringGeometry & {
  sectionId: ProfileSection['id'];
  label: string;
  note: string;
  side: 'left' | 'right';
  labelY: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// The string is a straight run from the post to the nut, then a quadratic
// body section. `bend` offsets the control point sideways; GSAP drives it when
// a string is plucked.
export function stringPath(string: GuitarString, bend: number): string {
  const restX: number = (string.nutX + string.bridgeX) / 2;
  const controlX: number = round2(restX + bend);
  return `M${string.postX} ${string.postY} L${string.nutX} ${NUT_Y} Q${controlX} ${BODY_CONTROL_Y} ${string.bridgeX} ${BRIDGE_Y}`;
}

export const guitarStrings: readonly GuitarString[] = GEOMETRY.map(
  (geometry: StringGeometry): GuitarString => {
    const section: ProfileSection | undefined = sections.find(
      (candidate: ProfileSection): boolean => candidate.stringIndex === geometry.index,
    );
    if (!section) {
      throw new Error(`Missing profile section for string ${geometry.index}`);
    }
    const row: number = (geometry.index - 1) % 3;
    return {
      ...geometry,
      sectionId: section.id,
      label: section.navLabel,
      note: section.note,
      side: geometry.index <= 3 ? 'left' : 'right',
      labelY: LABEL_ROWS[row] ?? LABEL_ROWS[0]!,
    };
  },
);
