/**
 * Structured story plan data mappings for porting Astralnaut Studios stories
 * into the Narrative Engine and Script Formatter.
 */

export interface StoryFormatDefault {
  medium: string;
  config?: Record<string, string>;
  label: string;
}

export interface StoryPlanMapping {
  /** Maps to Narrative Engine field keys */
  engineData: Record<string, string>;
  /** Script text for the Script Formatter */
  scriptText: string;
  /** Display title */
  title: string;
  /** Recommended default format for porting */
  defaultFormat?: StoryFormatDefault;
}

export const storyPlanMappings: Record<string, StoryPlanMapping> = {
  'battlefield-atlantis': {
    title: 'Battlefield: Atlantis',
    defaultFormat: { medium: 'film', config: { _film_length: '150' }, label: 'Feature Film (150 min)' },
    engineData: {
      // Core DNA
      theme: 'True leadership requires sacrifice, not just power.',
      protag_name: 'Zeuzano Constra (Zeus)',
      protag_archetype: 'Reluctant Sacrificial Hero',
      protag_flaw: 'Relies on overwhelming power; hasn\'t learned that some problems can\'t be solved by force alone.',
      protag_misbelief: 'That raw power is enough to protect the people he loves. If he\'s strong enough, no one gets hurt.',
      a_goal: 'Defend Alympia and stop Poseidon\'s invasion BEFORE the Nativus Luminator falls into enemy hands OR the planet is destroyed by Leviathans.',
      antag_name: 'Rikkard Poseidon',
      antag_want: 'Seize the Nativus Luminator and rule Earth by force, purging all non-human influence.',
      antag_belief: 'Earth belongs to Humans alone. The Tri-Planetary Coalition is an affront to everything they fought for. Grief over his daughter Arianna\'s death in Renoa City fuels his rage.',
      antag_flaw: 'Power without sacrifice — domination without responsibility. Mirror of Zeus: both wield immense power, but Poseidon uses it for vengeance rather than protection.',

      // A Story Act I
      a1_want: 'Zeus wants to defend Alympia from Poseidon\'s invasion and prevent the Nativus Luminator from falling into enemy hands.',
      a1_trigger: 'Sahntee Station on Mars orbit explodes, destroying Renoa City (population 3.8 million). Poseidon delivers a 24-hour ultimatum to deploy the Luminator.',
      a1_stakes: 'If the Neptunians or Gaians reach the Luminator, there won\'t be anyone left to save. The entire Tri-Planetary Coalition fractures.',
      a1_inciting: 'Poseidon\'s ultimatum at the TPC council: "Deploy the Luminator in 24 hours, or I will come to Alympia and do it myself." Prometheus withdraws Haydon\'s support, splitting the coalition.',
      a1_ponr: 'Zeus commits to defending Alympia. He orders the Stellos and Draconus to the Nerrian border and the Ryuken to geosynchronous orbit. There is no diplomatic path left.',

      // B Story Act I
      b1_flaws: 'Zeus commands through authority and force. His relationship with Rhea is strained — he overrides her humanitarian mission for military objectives. Astra hides her love for Zeus.',
      b1_contradiction: 'Zeus wants to protect his people but his method of protection — overwhelming force — is exactly what alienates his allies and puts everyone at greater risk.',
      b1_block: 'Zeus cannot conceive of a solution that requires personal sacrifice rather than personal power. Every problem he solves with force reinforces the belief that power alone is sufficient.',

      // C Story Act I
      c1_motivation: 'Poseidon\'s daughter Arianna was killed in the Renoa City explosion. His political rage is fueled by personal grief — he believes the TPC\'s inaction cost his daughter\'s life.',
      c1_understand: 'He fought alongside Zeus and Orion in the Second Gaian War. He was once an ally. His turn toward human supremacy stems from genuine loss.',
      c1_believe: 'He has the military power to back his threats — Neptunian forces, assassins, and the Leviathans. He\'s not bluffing.',
      c1_sympathize: 'A father who lost his daughter. His grief is real, even if his response is monstrous.',
      c1_goal: 'Force the deployment of the Nativus Luminator and establish human supremacy over Earth, by any means necessary.',

      // A Story Act II
      a2_plan: 'Zeus believes a show of military force — deploying the Allies and the Nerrian Defense Force — will deter Poseidon and end the crisis.',
      a2_win1: 'Astra and Orion repel Neptunian assassins sent to kill Zeus.',
      a2_win2: 'The Allies confront Poseidon on the beach. Orion holds a blade to Poseidon\'s throat.',
      a2_complication: 'Three Leviathans rise from the ocean. Poseidon brought "certain assurances" — creatures that threaten not just Alympia but the entire planet.',

      // Midpoint
      mid_choice: 'Zeus continues to fight with force, believing his military superiority will prevail — the RIGHT instinct (protect the planet) executed the WRONG way (more firepower vs. an existential threat).',
      mid_change: 'Poseidon raises SIX MORE Leviathans — eight total. This is no longer a battle. It\'s an extinction-level event.',
      mid_broken: 'Military force cannot stop eight Leviathans. The Allies are outmatched. Even the Ryuken in orbit can\'t handle this many.',
      mid_impossible: 'Poseidon reveals his true intent: "This isn\'t about destruction...It\'s about rebirth. Starting over." He doesn\'t want to rule — he wants to burn it all down.',

      // B Story Act II
      b2_warnings: 'Rhea\'s desperate attempts to contact Zeus. The jamming signal. Carlo\'s sensor readings showing the Leviathans\' unstoppable approach. "That\'s too many...not even the Allies can handle them all."',
      b2_flaw_active: 'Zeus has been collecting ambient energy since the first Leviathan appeared — planning a singularity. His reliance on raw power now demands the ultimate power play: one that will kill him.',
      b2_crisis: 'Zeus must face the truth that his power is not infinite — and that the only way to save everyone is to use all of it, including his life.',

      // C Story Act II
      c2_adapt: 'Poseidon escalates from ultimatum to assassination attempts to eight Leviathans. Each response from Zeus is met with a greater threat.',
      c2_learns: 'Poseidon knows Zeus\'s pride won\'t let him retreat. He exploits Zeus\'s need to stand and fight by creating a threat so massive that standing and fighting means dying.',

      // Low Point
      low_external: 'Eight Leviathans bearing down on Alympia. The Ryuken jammed. Military forces overwhelmed. No conventional solution exists.',
      low_internal: 'Zeus realizes he must open a singularity — a move that will kill him. Orion recognizes the plan: "You remember the last time—" Zeus: "I KNOW!....I remember."',
      low_finished: 'There is no version of this where Zeus survives. The only question is whether he has the courage to do what must be done.',

      // B Story Act III
      b3_revelation: '"I thought my power could protect everyone, but the truth is that true protection requires sacrifice, not dominance."',
      b3_decision: 'Zeus chooses to sacrifice himself. His telepathic farewell to Astra: "You are more powerful than you know... The worlds need you now, Astra."',

      // A Story Act III
      a3_plan: 'Zeus tags each Leviathan with a bioelectric charge, creating tethers for the singularity. He will open a quantum black hole and pull all eight Leviathans through it — with himself.',
      a3_confrontation: 'Zeus opens the gravimetric singularity. His lightning bolts serve as tethers, pulling the Leviathans toward the center.',
      a3_risked: 'His life, his marriage, his unborn child\'s future with a father.',
      a3_sacrificed: 'Zeus passes through the rift after the Leviathans — and is gone forever.',

      // C Story Act III
      c3_flaw: 'Poseidon\'s overconfidence. He assumed Zeus would fight conventionally. He didn\'t account for sacrifice — because he can\'t comprehend it.',
      c3_mirror: 'Both Zeus and Poseidon wield immense power. Zeus learns to give his up; Poseidon clings to his. Astra\'s ascension strips Poseidon of his powers — the ultimate reversal.',

      // Denouement
      den_truth: 'True leadership requires sacrifice, not just power. Zeus proved it with his life.',
      den_protag: 'Zeus is gone — but his sacrifice saved the world and triggered Astra\'s ascension.',
      den_support: 'Astra ascends to become Asterya. Rhea discovers she carries Zeus\'s child. Orion is left to carry the legacy.',
      den_world: 'Alympia is saved but forever changed. The Allies must rebuild without their leader. Poseidon\'s mind is wiped but his body vanishes.',
      den_cost: 'Zeus\'s life. Astra\'s humanity. The illusion that power alone can solve everything.',

      // Franchise
      fran_imbalance: 'Poseidon\'s bed is empty — he has vanished. Asterya searches the void for Zeus. Rhea carries the heir.',
      fran_watching: 'Asterya, now a cosmic being, searching for Zeus across the universe. The Gaians, who want Earth\'s water for their own Ascension experiments.',
      fran_system: 'The Risen — ancient beings beyond normal Ascension. The true history of Ascension and its connection to Earth\'s water and atmosphere.',
    },
    scriptText: `BATTLEFIELD: ATLANTIS — ISSUE 1: "EXORDIUM"

PAGE 1 — OPENING IMAGE
Panel 1: WIDE SHOT — Sahntee Station, Mars Orbit. A massive space station hangs against the red curve of Mars.
Panel 2: The station EXPLODES. Debris careens toward the planet surface.
Panel 3: RENOA CITY — Population counter: "3.8 million" crosses out to "0". The city is obliterated.
Panel 4: CAPTION: "The galaxy's fragile peace shattered in an instant."

PAGE 2 — THEME STATED / TPC COUNCIL
Panel 1: INT. TRI-PLANETARY COALITION CHAMBER — PLANET ARES. Emergency session. Holographic viewscreens. Delegates arguing.
Panel 2: POSEIDON appears on viewscreen.
POSEIDON: "If you don't deploy the Luminator in 24 hours, I will come to Alympia and do it myself."
Panel 3: ZEUS stands.
ZEUS: "Come to Alympia uninvited, you will not be leaving alive."
Panel 4: POSEIDON: "The Luminator WILL deploy one way...or the other. Stand in my way...and the blood of your precious Alympians will be on your hands. You have one day."`,
  },

  'darker-ages': {
    title: 'Darker Ages',
    defaultFormat: { medium: 'tv_series', config: { _tv_series_ep_length: '44', _tv_series_episodes: '10' }, label: 'TV Series (10 × 44 min)' },
    engineData: {
      theme: 'Hiding who you are leads to isolation and powerlessness; embracing who you are leads to connection and strength.',
      protag_name: 'Maven',
      protag_archetype: 'Hidden Chosen One',
      protag_flaw: 'Fear of her own magic leads her to hide, which isolates her from everyone.',
      protag_misbelief: '"Safety lies in secrecy." Her uncle taught her that hiding her power keeps her safe — but it\'s actually what makes her vulnerable.',
      a_goal: 'Find the nexus of souls and save her uncle from the Writhers BEFORE the temporal rift destabilizes reality and unravels the five kingdoms.',
      antag_name: 'The Heretic (leader of the Writhers)',
      antag_want: 'Destroy all who possess magical ability — eradicate magic from the five kingdoms.',
      antag_belief: 'He believes he is saving the world from the chaos of unchecked power. Fear of what you cannot control, disguised as religious righteousness.',
      antag_flaw: 'The false belief taken to its extreme — he was once a great sorcerer himself before becoming a zealot who destroys what he once was. Mirror of Maven\'s fear of her own power.',

      a1_want: 'Maven wants to rescue her uncle, who was taken by the Writhers when they attacked her village.',
      a1_trigger: 'A strange object falls from the sky — an escape pod containing Corbin Rothchylde\'s journal with a map to the nexus of souls. That same night, the Writhers attack and take Maven\'s uncle.',
      a1_stakes: 'Maven\'s uncle will die. If the temporal rift collapses, it will unravel all five kingdoms.',
      a1_inciting: 'The Writhers attack Maven\'s village and take her uncle. She is alone and afraid with only Rothchylde\'s journal and a map to a mythical realm.',
      a1_ponr: 'Maven commits to the quest. She steps out of her village for the first time, journal in hand, to find the nexus of souls.',

      b1_flaws: 'Maven practices magic in secret, hiding from everyone. Her uncle\'s teaching — "safety lies in secrecy" — keeps her isolated.',
      b1_contradiction: 'Maven wants to save her uncle but is terrified of using the very power that could save him. She wants connection but her hiding pushes everyone away.',
      b1_block: 'Fear of her own magic. Using it openly will make her a target for the Writhers, but NOT using it means she can\'t save anyone.',

      c1_motivation: 'The Heretic was once a great sorcerer who turned zealot. He believes unchecked magical power is chaos and destruction.',
      c1_understand: 'In a world where magic can destabilize reality (see: Rothchylde\'s temporal rift), his fear of unchecked power isn\'t entirely wrong.',
      c1_believe: 'He has demonic power and is virtually indomitable. His Writhers hunt and slaughter magic users with ruthless efficiency.',
      c1_sympathize: 'He represents what Maven fears becoming — someone defined and ultimately destroyed by power.',
      c1_goal: 'Eradicate all magic from the five kingdoms. Recruit or destroy Maven.',

      a2_plan: 'Maven believes she can follow Rothchylde\'s map to the nexus of souls and use its power to save her uncle and stop the Writhers.',
      a2_win1: 'Maven and Shinobu destroy a cursed wraith totem together — discovering they complement each other perfectly.',
      a2_win2: 'The trio (Maven, Shinobu, Titus) reaches the old man at the tavern who confirms the nexus is real and hidden in the ancient catacombs.',
      a2_complication: 'The temporal rift Rothchylde cast centuries ago is destabilizing reality itself. The stakes become existential — not just her uncle, but the entire world.',

      mid_choice: 'Maven uses her magic more openly to fight the Writhers, drawing attention — the RIGHT choice (fight back) made for the RIGHT reason (protect her friends), but it accelerates everything the Heretic wants.',
      mid_change: 'The Heretic appears in person, demonstrating demonic power. He offers Maven a choice: join the Writhers and live, or resist and watch her friends die.',
      mid_broken: 'Maven cannot hide anymore. Her original plan of quietly finding the nexus is shattered. The enemy knows exactly where she is.',
      mid_impossible: 'Reality itself is fraying — Shinobu sees spirits of people who haven\'t died yet. Titus\'s transformation accelerates uncontrollably.',

      b2_warnings: 'Titus\'s body is transforming into something powerful but frightening. Shinobu sees spirits of the living. Reality frays at the edges.',
      b2_flaw_active: 'Every time Maven hides or hesitates, the situation worsens. Her fear of using magic openly is now directly responsible for their failures.',
      b2_crisis: 'Maven must face the possibility that the nexus may never have existed — that her entire quest was based on a lie.',

      c2_adapt: 'The Heretic tracks the trio, escalating from wraith attacks to personal confrontation. He grows stronger as Maven grows more desperate.',
      c2_learns: 'The Heretic discovers Maven\'s deepest fear: that using her power will turn her into something like him. He exploits this mercilessly.',

      low_external: 'They reach the catacombs, but Corbin Rothchylde reveals the nexus may never have existed. It may have been a lie to lure Maven.',
      low_internal: 'Maven despairs. She\'s been hiding her whole life, and the one time she chose to act openly, it was based on a lie. Every fear about using her power has come true.',
      low_finished: 'Her uncle is gone, the nexus may not exist, and she\'s risked her friends\' lives for nothing.',

      b3_revelation: '"I thought hiding who I am kept me safe, but the truth is that embracing who I am — and then sacrificing it — is the only path to salvation."',
      b3_decision: 'Maven chooses to enter the catacombs and sacrifice her magic — the very thing she spent her life hiding — to seal the temporal rift and save the world.',

      a3_plan: 'Maven must enter the catacombs and sacrifice her magical ability to catalyze the rift\'s closure. Corbin must die to complete the seal.',
      a3_confrontation: 'Maven enters the catacombs. A mystical guardian tells her she cannot return. The nexus accepts her magic as the sacrifice.',
      a3_risked: 'Her magical ability — her defining gift. Her connection to this world (she will be transported to another).',
      a3_sacrificed: 'Maven\'s magic. Corbin Rothchylde\'s life. Maven and Shinobu are transported to another world — Battlefield: Atlantis, 35,000 years in the past.',

      c3_flaw: 'The Heretic\'s zealotry blinds him to the truth that power freely given (sacrifice) is more powerful than power forcibly taken.',
      c3_mirror: 'Both Maven and the Heretic fear magic. Maven overcomes that fear through sacrifice; the Heretic remains consumed by it.',

      den_truth: 'Hiding who you are leads to isolation. Embracing who you are — even giving it up — leads to connection and freedom.',
      den_protag: 'Maven is in a new world, powerless but free. No longer hiding. Standing beside Shinobu.',
      den_support: 'Shinobu chose connection over independence — she walked into the unknown with Maven. Titus found his honor and stays behind to protect their world.',
      den_world: 'The temporal rift is sealed. The five kingdoms are saved. But Maven and Shinobu are gone.',
      den_cost: 'Maven\'s magic. Her world. Her uncle is still gone. But she is free.',

      fran_imbalance: 'Maven and Shinobu arrive in the world of Battlefield: Atlantis, 35,000 years in the past — powerless in an alien world.',
      fran_watching: 'The connection between Darker Ages and Battlefield: Atlantis hints at a larger multiverse.',
      fran_system: 'The nexus of souls, the temporal rift, and the catacombs suggest forces that span worlds and timelines.',
    },
    scriptText: `DARKER AGES — ISSUE 1

PAGE 1 — OPENING IMAGE
Panel 1: WIDE SHOT — A small village on the outskirts of one of the five kingdoms of Draconion. Mist clings to thatched roofs. A forge glows in the predawn dark.
Panel 2: INT. FORGE — Maven practices magic in secret, small flames dancing between her fingers. Her uncle works at the anvil, pretending not to notice.
Panel 3: CLOSE — Maven's face, lit by her own fire. Fear and wonder in her eyes.
Panel 4: UNCLE: "Keep it hidden, girl. Safety lies in secrecy."
Panel 5: CAPTION: "She would spend her whole life believing that lie."`,
  },

  'episode-7': {
    title: 'Episode 7 (2011)',
    defaultFormat: { medium: 'film', config: { _film_length: '150' }, label: 'Feature Film (150 min)' },
    engineData: {
      theme: 'Identity is not inherited — it must be forged through choice.',
      protag_name: 'Xan Solo',
      protag_archetype: 'Dutiful Soldier / Coming-of-Age Hero',
      protag_flaw: 'She craves war and drastic action — her father\'s grit without his wisdom.',
      protag_misbelief: 'That her identity is defined by her parents\' legacy and her duty to the Republic. She believes being strong enough means being obedient enough.',
      a_goal: 'Protect the Republic and discover who she truly is BEFORE the Sith Pupil\'s forces destroy everything OR she loses herself to the dark side.',
      antag_name: 'The Sith Pupil',
      antag_want: 'Wield the balance of the Force for destruction and dominion.',
      antag_belief: 'Power is the only truth. Identity doesn\'t matter — only the Force matters. He pursued power without knowing who he was, and it consumed him.',
      antag_flaw: 'Power without identity — consumed by darkness because he never knew who he was. Dark mirror of Xan.',

      a1_want: 'Xan wants to protect the Republic and prove herself as a Jedi under Leia\'s command.',
      a1_trigger: 'Luke Skywalker returns from exile during a battle, demonstrating powers no Jedi has ever shown — lightning from clear sky, telekinesis that crushes star destroyers.',
      a1_stakes: 'A new threat could destroy the Republic. The galaxy is already fractured after Mon Mothma\'s death.',
      a1_inciting: 'Luke\'s dramatic return and offer to train Xan in the balance of the Force — light AND dark.',
      a1_ponr: 'Xan agrees to leave with Luke. She, Luke, and R2-D2 depart in the Millennium Falcon, abandoning her post as Leia\'s Chief of Security.',

      b1_flaws: 'Xan is fierce, skilled, and hungry for war. She has her father\'s grit but lacks wisdom. She follows orders without questioning why.',
      b1_contradiction: 'Xan wants to find her own identity but defines herself entirely through duty and lineage. She wants independence but obeys without question.',
      b1_block: 'She doesn\'t know who her parents really are. Her entire self-image is built on a carefully maintained secret.',

      c1_motivation: 'The Sith Pupil was once Luke\'s star student — brilliant, powerful, and lost. He fell to darkness pursuing the same balance Luke teaches.',
      c1_understand: 'He represents the real danger of Luke\'s philosophy: what happens when someone pursues the balance of the Force without a grounded identity.',
      c1_believe: 'He has the power to back his ambition. His attacks on three fronts show strategic brilliance.',
      c1_sympathize: 'He is what Xan could become. A cautionary tale, not a monster.',
      c1_goal: 'Demonstrate that the "balance of the Force" leads to destruction when wielded without discipline or identity.',

      a2_plan: 'Luke will train Xan in the balance of the Force — mastering both light and dark — to face the new threat.',
      a2_win1: 'Xan excels in training — lightsaber combat, Force visualization, everything comes naturally to her.',
      a2_win2: 'The Falcon is attacked mid-training and Xan uses her new skills under real fire.',
      a2_complication: 'Leia\'s fleet intercepts the Falcon. Leia accuses Luke of leading Xan down a dangerous path.',

      mid_choice: 'Xan learns the truth of her parentage — Leia is her mother, Han was her father, Lando has been her protector. Her entire identity shatters.',
      mid_change: 'Everything Xan believed about herself was a lie. She can\'t define herself through her parents\' legacy because she didn\'t even know the truth.',
      mid_broken: 'The simple training mission with Luke is now complicated by family politics, Leia\'s opposition, and Xan\'s identity crisis.',
      mid_impossible: 'Xan must face the dark side of the Force while her entire sense of self is collapsing.',

      b2_warnings: 'Luke\'s own students fell to darkness pursuing the same balance. The Sith Pupil is living proof of the danger.',
      b2_flaw_active: 'Xan\'s craving for action and her identity crisis pull her toward the dark side. Her grief after Luke\'s sacrifice threatens to consume her.',
      b2_crisis: 'Xan must face who she really is — not her mother\'s soldier, not her father\'s daughter, not her uncle\'s student. Something new.',

      c2_adapt: 'The Sith Pupil launches attacks on three fronts — skies over Coruscant, space, and ground — demonstrating uncontrolled balance powers.',
      c2_learns: 'The Sith Pupil reveals he was Luke\'s star student — showing Xan exactly what she could become if she loses herself to power.',

      low_external: 'Xan defeats the Sith Pupil, but Luke uses all his remaining power to save Coruscant. His physical form dissolves. The mentor is gone.',
      low_internal: 'Xan rages at Leia: "He only just found me. He didn\'t have to leave; you drove him away and now I hate you both." Her grief pulls her toward darkness.',
      low_finished: 'Luke is gone. Xan has no mentor, no clear identity, and her emotions threaten to pull her to the dark side.',

      b3_revelation: '"I thought I had to choose between Luke\'s path and Leia\'s path, but the truth is I can become something new — not light, not dark, but the Force itself."',
      b3_decision: 'Xan realizes the trick to being empowered without being corrupted is to "become the Force." She forges her own path.',

      a3_plan: 'Xan will find her own way — taking Luke\'s place among his remaining students, learning the balance on her own terms.',
      a3_confrontation: 'Leia declares a Second Galactic Empire with herself as Empress. Xan disagrees with this authoritarian turn and breaks away.',
      a3_risked: 'Her relationship with her mother. Her place in the Republic. Everything familiar.',
      a3_sacrificed: 'The comfort of belonging. She chooses to be alone rather than follow a path she doesn\'t believe in.',

      c3_flaw: 'The Sith Pupil pursued power without identity — and it consumed him. He couldn\'t answer the question "who am I?" and the darkness filled the void.',
      c3_mirror: 'Both the Sith Pupil and Xan face the same test: master the Force\'s balance. He failed because he had no identity anchor. Xan succeeds because she forges one.',

      den_truth: 'Identity is not inherited — it must be forged through choice. Xan is Captain Solo, on her own terms.',
      den_protag: 'Xan sets out alone in the Millennium Falcon to Dagobah, where Luke once failed Yoda\'s cave test. She will face what he could not.',
      den_support: 'Luke transcends — not dead or alive, but pure energy merged with the Force. Leia becomes Empress. Lando\'s duty is fulfilled.',
      den_world: 'The Republic becomes the Second Galactic Empire. A new order rises, and a new Jedi walks alone.',
      den_cost: 'Luke\'s physical existence. Xan\'s relationship with her mother. The Republic itself.',

      fran_imbalance: 'Leia\'s Second Galactic Empire introduces authoritarian rule. Xan walks a solitary path.',
      fran_watching: 'Luke, transcended beyond physical form. The remaining students of his philosophy.',
      fran_system: 'The true nature of the Force — beyond light and dark — hinted at through Luke\'s transcendence and Xan\'s potential.',
    },
    scriptText: `EPISODE 7 — TREATMENT

FADE IN:

EXT. SPACE — THE NEW REPUBLIC — 30 YEARS AFTER ENDOR

The galaxy is fractured. Mon Mothma has fallen in battle. Factions vie for territory. The Jedi Order under LEIA maintains a fragile peace.

INT. REPUBLIC COMMAND CENTER — DAY

XAN SOLO, Chief of Security, strongest Jedi in the order. Fierce, skilled, hungry for war. She moves through the command center with purpose.

LANDO CALRISSIAN stands at Leia's side — surrogate father, right hand, the man who kept his promise to a dead friend.

EXT. BATTLEFIELD — DAY

A battle rages against a powerful faction. Republic forces are losing ground. Then — a cloaked figure descends from the sky.

The figure removes his helmet.

LUKE SKYWALKER.

He turns the tide single-handedly. Lightning from a clear sky. Telekinetic force that crushes star destroyers. Powers no Jedi has ever demonstrated.

XAN watches, stunned.`,
  },

  'children-of-aquarius': {
    title: 'Children of Aquarius',
    defaultFormat: { medium: 'comic', config: { _comic_pages: '32', _comic_issues: '12' }, label: 'Comic Book (32pg / 12-issue)' },
    engineData: {
      theme: 'Power inherited is a prison; power earned through sacrifice is liberation. Those who seek to control destiny are consumed by it; those who give power away transform the world.',
      protag_name: 'Michael (Trinity) / Edmund Burke (Illuminati)',
      protag_archetype: 'Dual Protagonist — Reluctant Herald / Shattered Heir',
      protag_flaw: 'Michael: Impulsive and insecure; thinks he knows more than he does. Edmund: Blind loyalty to his father Carter and the Burke name prevents him from seeing the truth.',
      protag_misbelief: 'Michael: That he is just a weapon — a tool for Blaire\'s mission. Edmund: That the Burke dynasty is worth protecting and that his father\'s version of events is true.',
      a_goal: 'Michael: Understand his resurrection and protect the people he cares about. Edmund: Protect his family\'s legacy and maintain control in the Consortium power struggle. BOTH BEFORE the Christ Entity judges and destroys humanity.',
      antag_name: 'The Consortium / Carter Burke / Franco Renault / The Christ Entity',
      antag_want: 'The Consortium: Control world events. Franco Renault: Reclaim his son Edmund. The Christ Entity: Judge humanity and reset the Piscean age.',
      antag_belief: 'Franco Renault believes bloodline is destiny. The Christ Entity believes worlds that fail judgement must restart. Both believe control — inherited or cosmic — is the natural order.',
      antag_flaw: 'Obsession with control. Franco can\'t see that forcing loyalty destroys it. The Christ Entity can\'t conceive of a third option beyond pass/fail.',

      a1_want: 'Edmund wants to navigate the political fallout of the Ides of March attack. Michael wants to understand what happened to him and resurrect Stacy, the friend killed in the school shooting.',
      a1_trigger: 'Trinity: Michael is shot in a school shooting but his wound heals. He resurrects Lila by absorbing her fatal wound into his own body — his first manifestation of power. Detective Sepulveda witnesses the miracle. Illuminati: The "Execute" commands at Lexington (1775), Pearl Harbor (1941), and 9/11 (2001) establish centuries of Consortium manipulation. Historical trigger: Michael\'s birth during 9/11, delivered by Firefighter Gil in the burning WTC while Father Blaire, child Simon, and child Ryoko extract them.',
      a1_stakes: 'Illuminati: Global power shifts, civil war imminent. Trinity: If the Christ Child falls to the Consortium, the Apocalypse begins on their terms. Michael\'s adoptive family (Gil & Annie Dubinski) are now targets.',
      a1_inciting: 'Ryoko arrives at Gil Dubinski\'s home demanding to extract Michael: "He\'s out now, Gil. And they know." Seconds later, a missile destroys the house. This is the inciting incident that launches the main plot — connecting directly to Issue Two\'s opening.',
      a1_ponr: 'Edmund commits to his father\'s war against the Consortium. Michael insists on going to the hospital morgue to resurrect Stacy — a suicide mission.',

      b1_flaws: 'Edmund\'s blind loyalty to Carter. Michael\'s impulsiveness — he demands to go behind enemy lines immediately. Father Blaire\'s 120-year single-mindedness.',
      b1_contradiction: 'Edmund wants to protect his family but his family is built on lies. Michael wants to save people but doesn\'t understand his own powers yet.',
      b1_block: 'Edmund can\'t see past the Burke name. Michael can\'t see past his own ego — he thinks he knows more than Blaire.',

      c1_motivation: 'The Consortium has manipulated world events since 1775. Edmund Burke ordered the sniper kill at Lexington. Randall Burke ordered "Execute" at Pearl Harbor. Carter Burke fractured the Nine on 9/9/2001 when Rell Tambular — a Draconian alien — changed the target to New York. Carter\'s exit created the Final Eight, who ordered the 9/11 attack.',
      c1_understand: 'They believe they are steering humanity toward order. Each generation carries the weight of centuries of control.',
      c1_believe: 'They have the resources, the technology, and the ruthlessness. They orchestrated 9/11. Rell Tambular is an alien — the Consortium\'s reach extends beyond Earth.',
      c1_sympathize: 'Carter genuinely loves Edmund. Franco believes he\'s reclaiming his rightful heir. Gil — the firefighter who saved baby Michael during 9/11 and raised him as his own son — serves as the emotional grounding for the Trinity thread.',
      c1_goal: 'Control the Christ Child — or create their own (the Anti-Christ) — to maintain dominance over human destiny.',

      a2_plan: 'Illuminati: Edmund navigates political fallout, pushing a gun control bill. Trinity: Michael and Ryoko infiltrate the hospital to resurrect Stacy.',
      a2_win1: 'Trinity: Michael successfully resurrects Stacy in the hospital morgue.',
      a2_win2: 'Trinity: The team discovers Marcus, a teenage boy who may be the Christ Child. The Trinity learns the full extent of their powers.',
      a2_complication: 'Illuminati: The gun control bill triggers a second American Civil War. Trinity: Marcus may be the Anti-Christ instead of the Christ Child.',

      mid_choice: 'Illuminati: Edmund pushes forward with Carter\'s plan despite warning signs. Trinity: Michael\'s dual nature raises the question — is HE the Christ Child, or the "other"?',
      mid_change: 'Everything is uncertain. Edmund\'s loyalty is tested. Michael\'s identity as herald or weapon is unclear.',
      mid_broken: 'The simple plan (support Carter / protect Marcus) collapses as both storylines reveal deeper conspiracies.',
      mid_impossible: 'Carter is killed by Theresa Burke — his own wife, who faked her death and ensured 9/11\'s success. Edmund is captured by Renault\'s men.',

      b2_warnings: 'Simon sneaking out to see Madeline. Strange occurrences around Marcus suggesting dark influence. Emily investigating the Burkes at Randall\'s urging.',
      b2_flaw_active: 'Edmund\'s blind loyalty left him unable to see his mother\'s betrayal. Michael\'s impulsiveness puts the compound at risk.',
      b2_crisis: 'Edmund: Captured by Franco, about to learn the devastating truth about his parentage. Michael: Simon, manipulated by Madeline, may turn against the Trinity.',

      c2_adapt: 'Franco Renault captures Edmund. The Consortium infiltrates the Trinity compound and attempts to kidnap Marcus.',
      c2_learns: 'Franco learns Edmund\'s emotional weakness — his desperate need to belong to the Burke dynasty. The Consortium exploits internal divisions within the Trinity.',

      low_external: 'Edmund learns Franco is his father: "I am your father." His entire identity collapses. The Trinity compound is breached.',
      low_internal: 'Edmund\'s world is shattered. Simon\'s desire for recognition makes him vulnerable. Father Blaire\'s faith is tested by the truth about the Christ Entity.',
      low_finished: 'Edmund jumps from the plane. The Trinity is fractured. The Consortium holds the advantage.',

      b3_revelation: 'Blaire: "I thought I was serving God\'s will, but the truth is the visions were of alien experiments. The Trinity are cultivated humans who channel energy from the Source."',
      b3_decision: 'Michael chooses to face the Christ Entity on his own terms — not as a weapon, but as a vessel for change.',

      a3_plan: 'Retrieve the Lance of Longinus. But the truth is: it was never the lance — it was the believer who lost his faith. Father Blaire must betray the Christ Child to stop the Apocalypse.',
      a3_confrontation: 'The Christ Child defeats the Anti-Christ. Michael finds a loophole — takes the power back from the Christ Child. For a moment, he is all-powerful.',
      a3_risked: 'The fate of all living things. Michael\'s humanity.',
      a3_sacrificed: 'Michael gives away all-encompassing power. Instead of returning it to the Source, he distributes it as knowledge to all living things.',

      c3_flaw: 'The Consortium\'s obsession with control — creating the Anti-Christ, manipulating bloodlines — backfires. Their artificial counter to the Christ Entity fails.',
      c3_mirror: 'Franco Renault tried to control destiny through bloodline (Edmund). Michael chose to GIVE power away. Control vs. liberation.',

      den_truth: 'No born entity should have absolute power. Power given freely — as knowledge — transforms the world. The true Age of Aquarius begins.',
      den_protag: 'Michael is transformed — no longer confused, no longer a weapon, but the one who chose what humanity becomes.',
      den_support: 'Blaire lost his faith but found truth. Edmund and Emily survived. Ryoko, Simon, and Peter\'s powers are distributed to all.',
      den_world: 'All beings gain knowledge that they are part of a greater whole. The Age of Aquarius begins.',
      den_cost: 'Blaire\'s faith. Carter\'s life. Edmund\'s identity. Michael\'s omnipotence.',

      fran_imbalance: 'Randall Reynolds is revealed as Randall Renault — Franco\'s other son. Emily is pregnant. Franco says: "Go get my grandchild back."',
      fran_watching: 'Franco Renault, still alive, still scheming. The Consortium remnants.',
      fran_system: 'The 47 Colonies. The Draconians. The Church\'s intergalactic alliances. The Source and its inter-dimensional entities.',
    },
    scriptText: `CHILDREN OF AQUARIUS — ISSUE 1: "TRINITY"

PAGE 1 — INT. OFFICE - DAY (WTC, September 11th, 2001)
Panel 1: CLOSE on MARIA's face, screaming in agony. She is in labor.
Panel 2: PULL BACK — Maria on her back, FIREFIGHTER GIL helping deliver the baby. Smoke, dust and debris everywhere.
GIL: "I'm gonna get you and Baby Michael out of here, but I'm gonna need you to push!"
Panel 3: CAPTION: "New York City... SEPTEMBER 11TH, 2001"

PAGE 2 — EXT. BURNING TOWERS OF THE WTC
Panel 1: FULL PAGE — Manhattan skyline. The World Trade Center is on fire. Tower One is being struck by an airplane.
Panel 2: Maria and Gil react to the shockwave. GIL: "Jesus, Mary and Joseph...!"

PAGE 5 — INT. OFFICE
Panel 1: FATHER BLAIRE stands with child SIMON (7) and child RYOKO (6). Ryoko floats unconscious Gil telekinetically.
BLAIRE: "It is good to see you again, Maria. This is Simon and Ryoko. We are here to help."
Panel 4: Baby Michael is born. BLAIRE: "Children, look. He's here. The 'Third'."

PAGE 7 — EXT. ROOFTOP
Panel 1: Blaire, Monarch, Simon, and Ryoko watch the second tower crumble.
Panel 3: Maria holds baby Michael. MARIA: "Tell him he's not a mistake... he's a MIRACLE."
Panel 5: Maria dies. BLAIRE: "...and so much more."

PAGE 9 — INT. SCHOOL HALLWAY (Present Day)
Panel 1: BLAM! Michael wakes in a pool of blood. Shot in the chest.
Panel 2: LILA and STACY drag him into the science lab.

PAGE 11 — INT. SCIENCE LAB
Panel 1: JEFF kicks in the door. Kills STACY. His gun jams on LILA.
Panel 3: LILA shields Michael with her body. Jeff shoots her in the back.
Panel 4: Michael holds Lila. Her wound glows, closes — transfers to Michael's back. His first resurrection.
LILA: "Michael... I was there... I saw... everything."

PAGE 16 — EXT. LEXINGTON, MASSACHUSETTS — 1775
Panel 1: Minuteman encampment at night. Through a night vision scope.
CONTROL: "Bravo, this is Actual, Edmund Burke. Target confirmed. Ready on my command... EXECUTE."
CAPTION: "Ralph Waldo Emerson called it the 'Shot heard round the world.'"

PAGE 18 — INT. CONFERENCE ROOM — DECEMBER 7TH, 1941
RANDALL BURKE: "Execute." Japanese bombers descend on Pearl Harbor.

PAGE 19 — INT. CONFERENCE ROOM — SEPTEMBER 9TH, 2001
CARTER BURKE: "The plan was set. Philadelphia, D.C. and DALLAS... Not New York."
RELL TAMBULAR (DRACONIAN): "New York allows for a higher probability of success."
BURKE: "Do this, and you will not only have made a terrible mistake... but a terrible enemy."

PAGE 20 — The Final Eight.
RELL TAMBULAR: "Execute." The first plane crashes into the World Trade Center.

PAGE 21 — INT. MICHAEL'S BEDROOM — NIGHT (Present Day)
Michael wakes from Blaire's vision. Gil (older, his adoptive father) rushes in.
GIL: "Michael?! You okay?" MICHAEL: "Dad!"

PAGE 22 — INT. LIVING ROOM
RYOKO (26): "My name is Ryoko. Time is short. We leave tonight."
GIL: "You said 'talk'. You didn't say anything about taking him."
RYOKO: "He's out now, Gil. And they know."
RYOKO: "I'm special, you're special, people are coming to kill you."

PAGE 24 — EXT. MICHAEL'S HOME — NIGHT
A missile hits the house. The side explodes.
TO BE CONTINUED...`,
  },
};

/** Get all available story IDs */
export const getAvailableStoryIds = () => Object.keys(storyPlanMappings);

/** Get a story plan mapping by ID */
export const getStoryPlanMapping = (storyId: string): StoryPlanMapping | undefined =>
  storyPlanMappings[storyId];
