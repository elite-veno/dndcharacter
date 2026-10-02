// Eldritch Invocations without a level prerequisite above 1 (SRD 5.2, CC-BY-4.0). Short summaries, not full SRD text.

export const INVOCATIONS = [
  { id: 'agonizing-blast', name: 'Agonizing Blast', prerequisite: 'A Warlock cantrip that deals damage', desc: 'Choose a damage-dealing Warlock cantrip you know (such as Eldritch Blast); it deals extra damage equal to your Charisma modifier.' },
  { id: 'armor-of-shadows', name: 'Armor of Shadows', prerequisite: null, desc: 'You can cast Mage Armor on yourself at will, without a spell slot or Material components.' },
  { id: 'devils-sight', name: "Devil's Sight", prerequisite: null, desc: 'You can see normally in Dim Light and Darkness (both magical and nonmagical) within 120 feet.' },
  { id: 'eldritch-mind', name: 'Eldritch Mind', prerequisite: null, desc: 'You have Advantage on Constitution saving throws to maintain Concentration.' },
  { id: 'fiendish-vigor', name: 'Fiendish Vigor', prerequisite: null, desc: 'You can cast False Life on yourself at will, without a spell slot or Material components (using the highest possible roll at level 1).' },
  { id: 'gaze-of-two-minds', name: 'Gaze of Two Minds', prerequisite: null, desc: 'Touch a willing creature and perceive through its senses until the end of your next turn; repeat as a Bonus Action.' },
  { id: 'mask-of-many-faces', name: 'Mask of Many Faces', prerequisite: null, desc: 'You can cast Disguise Self at will, without a spell slot.' },
  { id: 'misty-visions', name: 'Misty Visions', prerequisite: null, desc: 'You can cast Silent Image at will, without a spell slot or Material components.' },
  { id: 'pact-of-the-blade', name: 'Pact of the Blade', prerequisite: null, desc: 'Bonus Action: conjure or bond a pact weapon. You are proficient with it, can use Charisma for its attacks and damage, and can make it Radiant, Necrotic, or Psychic.' },
  { id: 'pact-of-the-chain', name: 'Pact of the Chain', prerequisite: null, desc: 'You learn Find Familiar and can cast it as a Magic action without a slot; the familiar can take special forms (Imp, Pseudodragon, Quasit, Sphinx of Wonder, Skeleton, Slaad Tadpole, Sprite, Venomous Snake).' },
  { id: 'pact-of-the-tome', name: 'Pact of the Tome', prerequisite: null, desc: 'A Book of Shadows grants three extra cantrips from any class list and two level 1 ritual spells, and serves as your Spellcasting Focus.' },
  { id: 'repelling-blast', name: 'Repelling Blast', prerequisite: 'A Warlock cantrip that requires an attack roll', desc: 'When you hit a Large or smaller creature with a Warlock cantrip that requires an attack roll, you can push it up to 10 feet away from you.' },
];

export const INVOCATION_BY_ID = Object.fromEntries(INVOCATIONS.map((i) => [i.id, i]));
