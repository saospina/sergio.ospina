import { getDefaultSection, sections, type ProfileSection } from '../profile/profile';

export type GuitarString = {
  index: number;
  id: string;
  sectionId: ProfileSection['id'];
  label: string;
};

export type GuitarInteraction = (stringIndex: number) => void;

function toGuitarString(section: ProfileSection): GuitarString {
  return {
    index: section.stringIndex,
    id: `string-${section.stringIndex}`,
    sectionId: section.id,
    label: `String ${section.stringIndex}, ${section.title}`,
  };
}

export const guitarStrings: readonly GuitarString[] = [...sections]
  .sort((left: ProfileSection, right: ProfileSection) => left.stringIndex - right.stringIndex)
  .map(toGuitarString);

export const initialStringIndex: number = getDefaultSection().stringIndex;
