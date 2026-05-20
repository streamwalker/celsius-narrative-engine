import type { PanelcraftIssue, Page } from './types';
import { uid } from './constants';

export function makeIssue2(): PanelcraftIssue {
  const pageStubs: Array<{ number: number; side: 'L' | 'R'; title: string; cliff: boolean; summary: string }> = [
    { number: 1,  side: 'R', title: 'Cold Open',           cliff: true,  summary: "Splash of an alien fleet against the void. Voiceover defines 'Terrans' and a type 0 civilization. Tighten panel-by-panel toward one ship's bridge. Cliffhanger: silhouette on the bridge." },
    { number: 2,  side: 'L', title: 'Reveal — Pope',       cliff: false, summary: "Pope Benedict in full, issuing orders to a non-human helmsman. 'What are the 47 colonies?'" },
    { number: 3,  side: 'R', title: 'Vision',              cliff: true,  summary: "Michael in fire. Father Blaire telepathically: 'Wake up.' Cliffhanger: a hand seizing him through the smoke." },
    { number: 4,  side: 'L', title: "Reveal — Ryoko",      cliff: false, summary: "The hand is Ryoko's. Present day. The Sunderson home is burning around them." },
    { number: 5,  side: 'R', title: 'Escape Begins',       cliff: true,  summary: "TK shield deflects the blast. Gil takes shrapnel. Out the back. Cliffhanger: shock troops emerging from the bushes." },
    { number: 6,  side: 'L', title: 'Combat',              cliff: false, summary: 'Ryoko executes the troops with TK-enhanced martial arts. Compressed, brutal.' },
    { number: 7,  side: 'R', title: 'Pursuit',             cliff: true,  summary: "Drones overhead. Junction dialogue. Michael's confusion as a beat. Cliffhanger: a phone ringing in shadow." },
    { number: 8,  side: 'L', title: '1993, DC',            cliff: false, summary: 'J. Edgar Hoover Building. Sunderson startles upright. He looks eerily familiar.' },
    { number: 9,  side: 'R', title: 'Departure',           cliff: true,  summary: "Sunderson sneaks out, Berelli tails him. Cliffhanger: he approaches a man dressed as a priest." },
    { number: 10, side: 'L', title: 'Confrontation',       cliff: false, summary: 'Heated exchange between Sunderson and Blaire. History inferred without exposition.' },
    { number: 11, side: 'R', title: 'Berelli Confronts',   cliff: true,  summary: "Back at the car. 'He knows how to find Cassandra…' / 'When?' Cliffhanger: 'Tonight.'" },
    { number: 12, side: 'L', title: 'C-Story Enters',      cliff: false, summary: 'Present day. Carter Burke on the phone with the TOC director. Level 2 antagonist established.' },
    { number: 13, side: 'R', title: 'Burke Exposition',    cliff: true,  summary: "Assistant delivers the police report. Consortium has tracked Michael. Ryoko fragment planted. Cliffhanger: Burke issues an order." },
    { number: 14, side: 'L', title: 'Forest, 1993',        cliff: false, summary: 'Ridge above a lit clearing of modular buildings. Blaire, Sunderson, Berelli observing.' },
    { number: 15, side: 'R', title: 'Descent',             cliff: true,  summary: 'Establish scale of the operation. Cliffhanger: the alien mothership descending.' },
    { number: 16, side: 'L', title: 'Boarding',            cliff: false, summary: 'Blaire and Sunderson leap onto the ship as it lands. (Berelli stays on the ridge — confirm.)' },
    { number: 17, side: 'R', title: 'A-Story Breather',    cliff: true,  summary: "Family momentarily safe. Ryoko lets slip that Michael resurrected himself. He remembers healing Lila. Cliffhanger: he says Stacy's name." },
    { number: 18, side: 'L', title: 'The Demand',          cliff: false, summary: 'Michael insists on returning to the morgue. Ryoko refuses. He overrides her.' },
    { number: 19, side: 'R', title: 'Inside the Ship',     cliff: true,  summary: "Blaire and Sunderson find their daughter — young Cassandra. Reunion. Cliffhanger: Blaire senses the Christ Child telepathically." },
    { number: 20, side: 'L', title: 'The Mission',         cliff: false, summary: 'The Child is in transformation, dying. She charges Blaire with finding the heralds.' },
    { number: 21, side: 'R', title: 'Hospital Exterior',   cliff: true,  summary: 'AC duct panel being secured from inside — inversion of the establishing shot. Cliffhanger: they are already in the duct.' },
    { number: 22, side: 'L', title: 'Ducts',               cliff: false, summary: 'Crawl through. Ryoko projects a holographic schematic. Michael shut down before he can ask.' },
    { number: 23, side: 'R', title: 'Descent',             cliff: true,  summary: 'Elevator shaft. Ryoko TK-floats them down. Cliffhanger: morgue doors parting.' },
    { number: 24, side: 'L', title: 'Morgue',              cliff: false, summary: "Password under the keyboard. Stacy's locker pulled. Body bag unzipped." },
    { number: 25, side: 'R', title: '1993 Climax Begins',  cliff: true,  summary: 'Ship rattling into takeoff. Firefight. Cliffhanger: Sunderson takes a hit, falling.' },
    { number: 26, side: 'L', title: "Sunderson's End",     cliff: false, summary: "Sunderson dying. Blaire's promise. They make it off as the ship warps. 1993 thread closes for the issue." },
    { number: 27, side: 'R', title: 'Revival Attempt',     cliff: true,  summary: "Michael over Stacy's body, no idea how to begin. Cliffhanger: Ryoko sees a 'doctor' murder a security guard." },
    { number: 28, side: 'L', title: 'Ryoko Engages',       cliff: false, summary: "Hallway combat. The 'doctor' produces a gravimetric device. Ryoko's TK partially neutralized." },
    { number: 29, side: 'R', title: 'Parallel Climax',     cliff: true,  summary: "Intercut: Ryoko losing ground; Michael concentrating, Blaire's voice guiding him. Cliffhanger: Stacy's eyes open." },
    { number: 30, side: 'L', title: 'Collision',           cliff: false, summary: 'Fight crashes into the morgue. Ryoko goes down. Michael places himself in front of Stacy. The killer raises the weapon.' },
    { number: 31, side: 'R', title: 'Rescue and Connection', cliff: true, summary: "Energy blast from off-panel. A woman in tactical gear with a huge cannon. Same tattoo on the killer and the school shooter's body. Cliffhanger: Michael's recognition." },
    { number: 32, side: 'L', title: 'Closing Beat',        cliff: false, summary: 'Interior of a moving vehicle. The driver introduces herself: Cassandra Sunderson. TO BE CONTINUED.' },
  ];

  const exemplarPanels: Record<number, Page['panels']> = {
    1: [
      { id: uid(), function: 'SETUP', description: 'Wide splash. A fleet of alien craft against the void. Scale should be unsettling — these are not small ships.', lines: [
        { id: uid(), type: 'CAPTION', character: '', tone: 'CRYPTIC', text: 'This planet is not under the control of Terrans alone.' },
      ]},
      { id: uid(), function: 'EXPOSITION', description: 'Mid-shot. One ship in the fleet, isolated against the others.', lines: [
        { id: uid(), type: 'CAPTION', character: '', tone: 'DETACHED', text: '"Terrans"? A term for a type 0 civilization — a single-planet society that has not achieved inter-dimensional travel.' },
        { id: uid(), type: 'CAPTION', character: '', tone: 'DETACHED', text: 'Only the Church has access to that technology.' },
      ]},
      { id: uid(), function: 'TURN', description: 'Interior bridge. Wide. A robed figure stands at the helm window, back to camera, in conversation with a non-human helmsman.', lines: [
        { id: uid(), type: 'DIALOGUE', character: 'FIGURE', tone: 'COMMANDING', text: 'Status on the 47 colonies.' },
      ]},
    ],
    2: [
      { id: uid(), function: 'REVEAL', description: 'Three-quarter front view. The figure turns — Pope Benedict. Vestments. The helmsman registers as alien only on the second pass.', lines: [
        { id: uid(), type: 'DIALOGUE', character: 'POPE BENEDICT', tone: 'COMMANDING', text: 'What are the 47 colonies?' },
      ]},
      { id: uid(), function: 'BEAT', description: 'Tight on the helmsman, considering the question.', lines: [
        { id: uid(), type: 'DIALOGUE', character: 'HELMSMAN', tone: 'DETACHED', text: 'Holy Father — the colonies are silent.' },
      ]},
    ],
    3: [
      { id: uid(), function: 'TRANSITION', description: 'Hard cut from space-bridge to fire. Michael on his back in the burning house, smoke rendering the room as a blur.', lines: [
        { id: uid(), type: 'SFX', character: '', tone: '', text: 'KRRSSSHH' },
      ]},
      { id: uid(), function: 'EXPOSITION', description: "Overlay panel — Blaire's telepathic presence rendered as an augmented-reality figure superimposed over the fire.", lines: [
        { id: uid(), type: 'DIALOGUE', character: 'BLAIRE (telepathic)', tone: 'GRAVE', text: 'Michael. Listen to me.' },
        { id: uid(), type: 'DIALOGUE', character: 'BLAIRE (telepathic)', tone: 'COMMANDING', text: 'You have to wake up.' },
      ]},
      { id: uid(), function: 'TURN', description: 'Pull back. A gloved hand pushes through the smoke toward Michael, fingers reaching for his collar.', lines: [
        { id: uid(), type: 'DIALOGUE', character: 'MICHAEL', tone: 'CONFUSED', text: 'Who —' },
      ]},
    ],
  };

  return {
    title: 'Issue 2',
    theme: 'A warning of things to come.',
    pages: pageStubs.map(s => ({
      number: s.number,
      side: s.side,
      title: s.title,
      summary: s.summary,
      isCliffhanger: s.cliff,
      panels: exemplarPanels[s.number] || [],
    })),
  };
}
