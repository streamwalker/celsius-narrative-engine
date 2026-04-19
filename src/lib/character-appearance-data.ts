// ── Character Appearance Data Catalog ──

export interface ClothingItem {
  label: string;
  promptHint: string;
}

export interface ClothingCategory {
  label: string;
  slots: Record<string, ClothingItem[]>;
}

export const SKIN_TONES = [
  { label: "Porcelain", value: "porcelain", hex: "#FDEBD3" },
  { label: "Fair", value: "fair", hex: "#F5D6B8" },
  { label: "Light", value: "light", hex: "#E8C4A0" },
  { label: "Medium", value: "medium", hex: "#D4A574" },
  { label: "Tan", value: "tan", hex: "#C68E5B" },
  { label: "Olive", value: "olive", hex: "#A8845A" },
  { label: "Brown", value: "brown", hex: "#8B6B4A" },
  { label: "Dark Brown", value: "dark-brown", hex: "#6B4E35" },
  { label: "Deep", value: "deep", hex: "#4A3728" },
  { label: "Ebony", value: "ebony", hex: "#3B2820" },
];

export const HAIR_STYLES = [
  "Bald", "Buzzcut", "Short Cropped", "Short Wavy", "Medium Straight", "Medium Wavy",
  "Long Straight", "Long Wavy", "Long Curly", "Braided", "Cornrows", "Ponytail",
  "Topknot", "Mohawk", "Dreadlocks", "Afro", "Slicked Back", "Undercut",
];

export const HAIR_COLORS = [
  { label: "Black", value: "black", hex: "#1a1a1a" },
  { label: "Dark Brown", value: "dark-brown", hex: "#3b2314" },
  { label: "Brown", value: "brown", hex: "#6b4226" },
  { label: "Auburn", value: "auburn", hex: "#8b3a2a" },
  { label: "Red", value: "red", hex: "#b03020" },
  { label: "Ginger", value: "ginger", hex: "#c46030" },
  { label: "Blonde", value: "blonde", hex: "#d4a860" },
  { label: "Platinum", value: "platinum", hex: "#e8dcc8" },
  { label: "White", value: "white", hex: "#f0ece4" },
  { label: "Silver", value: "silver", hex: "#c0c0c0" },
  { label: "Blue", value: "blue", hex: "#3060b0" },
  { label: "Purple", value: "purple", hex: "#6030a0" },
  { label: "Green", value: "green", hex: "#308040" },
  { label: "Pink", value: "pink", hex: "#d060a0" },
];

export const FACIAL_HAIR_OPTIONS = [
  "Clean-Shaven", "Stubble", "Goatee", "Full Beard", "Mustache",
  "Mutton Chops", "Braided Beard", "Soul Patch", "Van Dyke", "Handlebar Mustache",
];

export const EYE_SHAPES = [
  "Almond", "Round", "Hooded", "Upturned", "Downturned", "Monolid", "Deep-Set", "Wide-Set",
];

export const EYE_COLORS = [
  { label: "Brown", value: "brown", hex: "#634e34" },
  { label: "Dark Brown", value: "dark-brown", hex: "#3b2314" },
  { label: "Amber", value: "amber", hex: "#b5651d" },
  { label: "Hazel", value: "hazel", hex: "#7b7135" },
  { label: "Green", value: "green", hex: "#3d6b4f" },
  { label: "Blue", value: "blue", hex: "#4a7c9b" },
  { label: "Gray", value: "gray", hex: "#7a8b8b" },
  { label: "Ice Blue", value: "ice-blue", hex: "#a5c8d4" },
  { label: "Violet", value: "violet", hex: "#7a4988" },
  { label: "Heterochromia", value: "heterochromia", hex: "linear-gradient(90deg, #4a7c9b 50%, #634e34 50%)" },
];

export const POSTURE_OPTIONS = [
  "Upright", "Relaxed", "Hunched", "Confident", "Guarded", "Slouched",
];

export const AGE_LABELS = [
  { min: 0, max: 15, label: "Young Teen", descriptor: "youthful teenage" },
  { min: 16, max: 25, label: "Young Adult", descriptor: "young adult" },
  { min: 26, max: 35, label: "Adult", descriptor: "adult" },
  { min: 36, max: 50, label: "Middle-Aged", descriptor: "middle-aged" },
  { min: 51, max: 65, label: "Mature", descriptor: "mature" },
  { min: 66, max: 100, label: "Elder", descriptor: "elderly" },
];

export const GENDER_PRESENTATIONS = [
  { value: "masculine", label: "Masculine", descriptor: "masculine-presenting" },
  { value: "feminine", label: "Feminine", descriptor: "feminine-presenting" },
  { value: "androgynous", label: "Androgynous", descriptor: "androgynous" },
];

export const DISTINGUISHING_MARKS = [
  "Facial Scar", "Eye Patch", "Battle Scars", "Burn Marks", "Tribal Tattoo",
  "Sleeve Tattoo", "Face Tattoo", "Neck Tattoo", "Birthmark", "Freckles",
  "Beauty Mark", "Cybernetic Eye", "Mechanical Arm", "Missing Ear", "Broken Nose",
];

export const CLOTHING_SLOTS = ["Top", "Bottom", "Outerwear", "Footwear", "Headwear", "Accessories"] as const;
export type ClothingSlot = typeof CLOTHING_SLOTS[number];

export const CLOTHING_CATEGORIES: Record<string, ClothingCategory> = {
  Business: {
    label: "Business",
    slots: {
      Top: [
        { label: "Dress Shirt", promptHint: "crisp white dress shirt with collar" },
        { label: "Blouse", promptHint: "elegant silk blouse" },
        { label: "Polo Shirt", promptHint: "business polo shirt" },
        { label: "Turtleneck", promptHint: "fitted turtleneck sweater" },
      ],
      Bottom: [
        { label: "Dress Pants", promptHint: "tailored dress pants" },
        { label: "Pencil Skirt", promptHint: "fitted pencil skirt" },
        { label: "Chinos", promptHint: "pressed chinos" },
        { label: "Suit Trousers", promptHint: "formal suit trousers" },
      ],
      Outerwear: [
        { label: "Suit Jacket", promptHint: "tailored suit jacket" },
        { label: "Blazer", promptHint: "structured blazer" },
        { label: "Overcoat", promptHint: "long wool overcoat" },
        { label: "Vest", promptHint: "formal waistcoat vest" },
      ],
      Footwear: [
        { label: "Oxfords", promptHint: "polished oxford shoes" },
        { label: "Loafers", promptHint: "leather loafers" },
        { label: "Heels", promptHint: "elegant heeled shoes" },
        { label: "Dress Boots", promptHint: "polished dress boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Fedora", promptHint: "classic fedora hat" },
        { label: "Beret", promptHint: "stylish beret" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Tie", promptHint: "silk necktie" },
        { label: "Watch", promptHint: "luxury wristwatch" },
        { label: "Cufflinks", promptHint: "ornate cufflinks" },
        { label: "Briefcase", promptHint: "leather briefcase" },
      ],
    },
  },
  "Business Casual": {
    label: "Business Casual",
    slots: {
      Top: [
        { label: "Button-Down", promptHint: "open-collar button-down shirt" },
        { label: "Henley", promptHint: "casual henley shirt" },
        { label: "Sweater", promptHint: "fitted crew-neck sweater" },
        { label: "Linen Shirt", promptHint: "relaxed linen shirt" },
      ],
      Bottom: [
        { label: "Slacks", promptHint: "smart casual slacks" },
        { label: "Dark Jeans", promptHint: "dark-wash fitted jeans" },
        { label: "Khakis", promptHint: "pressed khaki pants" },
        { label: "Culottes", promptHint: "wide-leg culottes" },
      ],
      Outerwear: [
        { label: "Cardigan", promptHint: "knit cardigan" },
        { label: "Bomber Jacket", promptHint: "casual bomber jacket" },
        { label: "Denim Jacket", promptHint: "denim jacket" },
        { label: "Sport Coat", promptHint: "relaxed sport coat" },
      ],
      Footwear: [
        { label: "Chukka Boots", promptHint: "suede chukka boots" },
        { label: "White Sneakers", promptHint: "clean white leather sneakers" },
        { label: "Loafers", promptHint: "casual leather loafers" },
        { label: "Ankle Boots", promptHint: "sleek ankle boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Flat Cap", promptHint: "tweed flat cap" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Leather Belt", promptHint: "leather belt with silver buckle" },
        { label: "Scarf", promptHint: "casual knit scarf" },
        { label: "Messenger Bag", promptHint: "canvas messenger bag" },
      ],
    },
  },
  Cyberpunk: {
    label: "Cyberpunk",
    slots: {
      Top: [
        { label: "Neon Crop Top", promptHint: "neon-lit crop top with circuit patterns" },
        { label: "Tech Vest", promptHint: "armored tech vest with LED strips" },
        { label: "Mesh Shirt", promptHint: "transparent mesh shirt with holographic panels" },
        { label: "Cyber Harness", promptHint: "chest harness with embedded tech modules" },
        { label: "Holo-Jacket", promptHint: "holographic-shifting jacket" },
      ],
      Bottom: [
        { label: "Cargo Pants", promptHint: "tactical cargo pants with glowing seams" },
        { label: "Synth-Leather Pants", promptHint: "form-fitting synthetic leather pants" },
        { label: "Tech Shorts", promptHint: "armored shorts with utility pockets" },
        { label: "Holo-Skirt", promptHint: "holographic pleated skirt" },
      ],
      Outerwear: [
        { label: "Trench Coat", promptHint: "long black trench coat with neon-lined collar" },
        { label: "Cyber Jacket", promptHint: "armored jacket with LED piping and shoulder pads" },
        { label: "Cloak", promptHint: "tech-cloak with active camouflage panels" },
        { label: "Bomber", promptHint: "neon-accented bomber jacket with HUD visor" },
      ],
      Footwear: [
        { label: "Platform Boots", promptHint: "heavy platform boots with LED soles" },
        { label: "Cyber Sneakers", promptHint: "sleek sneakers with holographic accents" },
        { label: "Mech Boots", promptHint: "mechanized boots with hydraulic ankles" },
        { label: "Blade Runners", promptHint: "blade-runner style boots with retractable spikes" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Visor", promptHint: "wraparound holographic visor" },
        { label: "Neural Crown", promptHint: "neural interface headband with glowing nodes" },
        { label: "Gas Mask", promptHint: "stylized gas mask with LED eyes" },
        { label: "Cyber Mohawk", promptHint: "synthetic mohawk with fiber-optic strands" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Arm Implants", promptHint: "visible cybernetic arm implants with glowing circuits" },
        { label: "Holo-Watch", promptHint: "holographic wrist display" },
        { label: "Neck Cables", promptHint: "neural cables running from neck to shoulder" },
        { label: "LED Tattoos", promptHint: "bioluminescent animated tattoos" },
      ],
    },
  },
  Futuristic: {
    label: "Futuristic / Sci-Fi",
    slots: {
      Top: [
        { label: "Uniform Tunic", promptHint: "sleek futuristic uniform tunic with rank insignia" },
        { label: "Flight Suit", promptHint: "form-fitting pilot flight suit" },
        { label: "Tactical Armor", promptHint: "lightweight futuristic tactical chest armor" },
        { label: "Science Coat", promptHint: "long white science officer coat with holographic trim" },
        { label: "Combat Suit", promptHint: "advanced combat bodysuit with energy shielding" },
      ],
      Bottom: [
        { label: "Uniform Pants", promptHint: "sleek uniform pants with magnetic boots" },
        { label: "Armor Leggings", promptHint: "armored leg plates over bodysuit" },
        { label: "Cargo Fatigues", promptHint: "futuristic military cargo fatigues" },
        { label: "Jumpsuit", promptHint: "one-piece futuristic jumpsuit" },
      ],
      Outerwear: [
        { label: "Officer's Cape", promptHint: "flowing officer's cape with rank clasps" },
        { label: "EVA Jacket", promptHint: "space-rated EVA jacket with sealed collar" },
        { label: "Energy Shield Cloak", promptHint: "cloak with integrated energy shield generator" },
        { label: "Command Vest", promptHint: "tactical command vest with communication array" },
      ],
      Footwear: [
        { label: "Mag Boots", promptHint: "magnetic-lock boots for zero-gravity" },
        { label: "Combat Boots", promptHint: "armored futuristic combat boots" },
        { label: "Hover Shoes", promptHint: "sleek hover-capable shoes" },
        { label: "Pilot Boots", promptHint: "reinforced pilot boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Comm Earpiece", promptHint: "holographic communication earpiece" },
        { label: "Tactical Helmet", promptHint: "sleek tactical helmet with HUD visor" },
        { label: "Officer's Cap", promptHint: "futuristic officer's peaked cap" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Holstered Pistol", promptHint: "energy pistol in thigh holster" },
        { label: "Data Pad", promptHint: "holographic data pad" },
        { label: "Rank Insignia", promptHint: "gleaming rank insignia on chest" },
        { label: "Utility Belt", promptHint: "tactical utility belt with pouches" },
      ],
    },
  },
  Medieval: {
    label: "Medieval",
    slots: {
      Top: [
        { label: "Chainmail Tunic", promptHint: "chainmail tunic over padded gambeson" },
        { label: "Leather Jerkin", promptHint: "worn leather jerkin with buckles" },
        { label: "Monk Robes", promptHint: "hooded monk robes" },
        { label: "Noble Doublet", promptHint: "ornate noble doublet with embroidery" },
        { label: "Fur-Lined Vest", promptHint: "fur-lined leather vest" },
        { label: "Peasant Tunic", promptHint: "simple linen peasant tunic" },
      ],
      Bottom: [
        { label: "Breeches", promptHint: "fitted leather breeches" },
        { label: "Leg Armor", promptHint: "plate leg armor over chainmail" },
        { label: "Cloth Pants", promptHint: "rough-spun cloth trousers" },
        { label: "Riding Pants", promptHint: "reinforced riding pants" },
        { label: "Long Skirt", promptHint: "flowing medieval skirt" },
      ],
      Outerwear: [
        { label: "Full Plate", promptHint: "full plate armor with heraldic tabard" },
        { label: "Hooded Cloak", promptHint: "dark hooded cloak with clasp" },
        { label: "Fur Mantle", promptHint: "heavy fur mantle over shoulders" },
        { label: "Surcoat", promptHint: "heraldic surcoat over armor" },
        { label: "Traveling Cape", promptHint: "weathered traveling cape" },
      ],
      Footwear: [
        { label: "Leather Boots", promptHint: "tall leather boots" },
        { label: "Armored Sabatons", promptHint: "plate armor sabatons" },
        { label: "Sandals", promptHint: "simple leather sandals" },
        { label: "Fur Boots", promptHint: "fur-lined winter boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Iron Helm", promptHint: "iron great helm" },
        { label: "Crown", promptHint: "ornate golden crown" },
        { label: "Hood", promptHint: "deep drawn hood" },
        { label: "Circlet", promptHint: "silver circlet on brow" },
        { label: "Coif", promptHint: "chainmail coif" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Sword & Scabbard", promptHint: "longsword in ornate scabbard at hip" },
        { label: "Shield", promptHint: "heraldic kite shield on back" },
        { label: "Amulet", promptHint: "glowing amulet around neck" },
        { label: "Belt Pouch", promptHint: "leather belt with coin pouch" },
      ],
    },
  },
  Ancient: {
    label: "Ancient / Classical",
    slots: {
      Top: [
        { label: "Toga", promptHint: "draped white toga with gold trim" },
        { label: "Chiton", promptHint: "pleated Greek chiton" },
        { label: "Bronze Cuirass", promptHint: "polished bronze muscled cuirass" },
        { label: "Linen Wrap", promptHint: "Egyptian linen chest wrap with gold bands" },
        { label: "War Paint Only", promptHint: "bare chest with tribal war paint" },
      ],
      Bottom: [
        { label: "Pteruges", promptHint: "leather pteruges skirt" },
        { label: "Loincloth", promptHint: "simple linen loincloth" },
        { label: "Draped Skirt", promptHint: "draped fabric skirt with golden belt" },
        { label: "Leather Strips", promptHint: "gladiatorial leather strip skirt" },
      ],
      Outerwear: [
        { label: "Himation", promptHint: "draped himation cloak" },
        { label: "War Cloak", promptHint: "crimson war cloak pinned at shoulder" },
        { label: "Leopard Skin", promptHint: "leopard skin draped over shoulders" },
        { label: "Priestly Robes", promptHint: "flowing priestly robes with sacred symbols" },
      ],
      Footwear: [
        { label: "Gladiator Sandals", promptHint: "laced gladiator sandals" },
        { label: "Caligae", promptHint: "Roman military caligae boots" },
        { label: "Bare Feet", promptHint: "barefoot" },
        { label: "Reed Sandals", promptHint: "simple reed sandals" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Laurel Wreath", promptHint: "golden laurel wreath crown" },
        { label: "Corinthian Helm", promptHint: "bronze Corinthian helmet with red crest" },
        { label: "Pharaoh Crown", promptHint: "double crown of Upper and Lower Egypt" },
        { label: "Centurion Helm", promptHint: "Roman centurion helmet with transverse crest" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Gladius", promptHint: "Roman gladius sword at hip" },
        { label: "Spear", promptHint: "long bronze-tipped spear" },
        { label: "Round Shield", promptHint: "round bronze shield with emblems" },
        { label: "Gold Jewelry", promptHint: "heavy gold necklace and arm bands" },
      ],
    },
  },
  Military: {
    label: "Military",
    slots: {
      Top: [
        { label: "Combat BDU", promptHint: "camouflage battle dress uniform top" },
        { label: "Tactical Vest", promptHint: "tactical plate carrier vest with MOLLE webbing" },
        { label: "Dress Uniform", promptHint: "formal military dress uniform with medals" },
        { label: "Tank Top + Dog Tags", promptHint: "olive drab tank top with dog tags" },
        { label: "Ghillie Top", promptHint: "ghillie suit camouflage top" },
      ],
      Bottom: [
        { label: "Cargo BDU", promptHint: "military cargo BDU pants" },
        { label: "Dress Pants", promptHint: "military dress uniform trousers with stripe" },
        { label: "Tactical Pants", promptHint: "reinforced tactical pants with knee pads" },
        { label: "Flight Suit", promptHint: "pilot flight suit lower" },
      ],
      Outerwear: [
        { label: "Field Jacket", promptHint: "military field jacket" },
        { label: "Pea Coat", promptHint: "navy double-breasted pea coat" },
        { label: "Trench Coat", promptHint: "military officer trench coat" },
        { label: "Poncho", promptHint: "military rain poncho" },
      ],
      Footwear: [
        { label: "Combat Boots", promptHint: "black military combat boots" },
        { label: "Jump Boots", promptHint: "paratrooper jump boots" },
        { label: "Dress Shoes", promptHint: "polished military dress shoes" },
        { label: "Desert Boots", promptHint: "tan desert combat boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Beret", promptHint: "military beret with insignia" },
        { label: "Patrol Cap", promptHint: "camouflage patrol cap" },
        { label: "Officer's Cap", promptHint: "peaked officer's cap" },
        { label: "Helmet", promptHint: "military combat helmet with goggles" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Rifle", promptHint: "assault rifle slung across back" },
        { label: "Sidearm", promptHint: "holstered sidearm" },
        { label: "Radio", promptHint: "tactical radio on chest" },
        { label: "Medals", promptHint: "row of service medals on chest" },
      ],
    },
  },
  Streetwear: {
    label: "Streetwear",
    slots: {
      Top: [
        { label: "Graphic Tee", promptHint: "oversized graphic t-shirt" },
        { label: "Hoodie", promptHint: "baggy hoodie with streetwear logo" },
        { label: "Jersey", promptHint: "vintage basketball jersey" },
        { label: "Flannel", promptHint: "open flannel shirt over tank top" },
      ],
      Bottom: [
        { label: "Baggy Jeans", promptHint: "baggy distressed jeans" },
        { label: "Joggers", promptHint: "tapered jogger pants" },
        { label: "Cargo Shorts", promptHint: "oversized cargo shorts" },
        { label: "Track Pants", promptHint: "side-stripe track pants" },
      ],
      Outerwear: [
        { label: "Windbreaker", promptHint: "colorful windbreaker jacket" },
        { label: "Puffer Vest", promptHint: "puffy down vest" },
        { label: "Varsity Jacket", promptHint: "varsity letterman jacket" },
        { label: "Oversized Denim", promptHint: "oversized denim jacket" },
      ],
      Footwear: [
        { label: "High-Top Sneakers", promptHint: "high-top sneakers" },
        { label: "Jordans", promptHint: "retro basketball sneakers" },
        { label: "Slides", promptHint: "casual slides with socks" },
        { label: "Boots", promptHint: "chunky utility boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Snapback", promptHint: "snapback cap worn backwards" },
        { label: "Beanie", promptHint: "slouchy knit beanie" },
        { label: "Bucket Hat", promptHint: "bucket hat" },
        { label: "Durag", promptHint: "silk durag" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Chain", promptHint: "heavy gold chain necklace" },
        { label: "Backpack", promptHint: "designer backpack" },
        { label: "Sunglasses", promptHint: "wraparound sunglasses" },
        { label: "Rings", promptHint: "chunky statement rings" },
      ],
    },
  },
  Formal: {
    label: "Formal / Regal",
    slots: {
      Top: [
        { label: "Royal Tunic", promptHint: "richly embroidered royal tunic" },
        { label: "Ballgown Bodice", promptHint: "corseted ballgown bodice with jewels" },
        { label: "Ceremonial Armor", promptHint: "gilded ceremonial armor chestplate" },
        { label: "Silk Shirt", promptHint: "flowing silk shirt with ruffled collar" },
      ],
      Bottom: [
        { label: "Royal Trousers", promptHint: "tailored royal trousers with gold trim" },
        { label: "Ballgown Skirt", promptHint: "flowing ballgown skirt with train" },
        { label: "Armored Leggings", promptHint: "gilded armored leggings" },
        { label: "Silk Pants", promptHint: "flowing silk pants" },
      ],
      Outerwear: [
        { label: "Royal Robe", promptHint: "flowing royal robe with fur trim and long train" },
        { label: "Ermine Cape", promptHint: "ermine-trimmed cape with jeweled clasp" },
        { label: "Opera Coat", promptHint: "velvet opera coat" },
        { label: "Ceremonial Cloak", promptHint: "jewel-encrusted ceremonial cloak" },
      ],
      Footwear: [
        { label: "Royal Slippers", promptHint: "embroidered royal slippers" },
        { label: "Jeweled Heels", promptHint: "jewel-encrusted heeled shoes" },
        { label: "Polished Boots", promptHint: "knee-high polished leather boots" },
        { label: "Gilded Sandals", promptHint: "golden gilded sandals" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Crown", promptHint: "ornate jeweled crown" },
        { label: "Tiara", promptHint: "elegant diamond tiara" },
        { label: "Diadem", promptHint: "golden diadem with central gemstone" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Scepter", promptHint: "golden royal scepter" },
        { label: "Royal Signet", promptHint: "royal signet ring" },
        { label: "Jeweled Necklace", promptHint: "elaborate jeweled necklace" },
        { label: "Ceremonial Sword", promptHint: "ornate ceremonial sword at hip" },
      ],
    },
  },
  Steampunk: {
    label: "Steampunk",
    slots: {
      Top: [
        { label: "Corset Vest", promptHint: "leather corset vest with brass buckles" },
        { label: "Ruffled Shirt", promptHint: "ruffled Victorian shirt with cravat" },
        { label: "Aviator Jacket", promptHint: "leather aviator jacket with brass goggles" },
        { label: "Clockwork Harness", promptHint: "chest harness with clockwork mechanisms" },
        { label: "Engineer Apron", promptHint: "heavy canvas engineer apron with tool loops" },
      ],
      Bottom: [
        { label: "Riding Breeches", promptHint: "high-waisted riding breeches" },
        { label: "Layered Skirt", promptHint: "layered bustle skirt with gears" },
        { label: "Striped Pants", promptHint: "pinstripe Victorian trousers" },
        { label: "Utility Kilt", promptHint: "leather utility kilt with pouches" },
      ],
      Outerwear: [
        { label: "Long Coat", promptHint: "long Victorian coat with brass buttons and gear accents" },
        { label: "Cape", promptHint: "short cape with cog-shaped clasp" },
        { label: "Duster", promptHint: "oilskin duster coat" },
        { label: "Bolero Jacket", promptHint: "fitted bolero jacket with brass trim" },
      ],
      Footwear: [
        { label: "Lace-Up Boots", promptHint: "tall lace-up boots with brass eyelets" },
        { label: "Spat Shoes", promptHint: "Victorian shoes with spats" },
        { label: "Clockwork Boots", promptHint: "boots with visible clockwork ankle mechanisms" },
        { label: "Knee Boots", promptHint: "leather knee-high boots with buckles" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Top Hat", promptHint: "top hat with brass goggles and gears" },
        { label: "Aviator Goggles", promptHint: "brass aviator goggles on forehead" },
        { label: "Bowler Hat", promptHint: "bowler hat with clockwork band" },
        { label: "Pith Helmet", promptHint: "pith helmet with brass fittings" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Pocket Watch", promptHint: "ornate brass pocket watch on chain" },
        { label: "Mechanical Arm", promptHint: "brass mechanical prosthetic arm" },
        { label: "Ray Gun", promptHint: "brass ray gun in holster" },
        { label: "Monocle", promptHint: "brass monocle with magnification lenses" },
      ],
    },
  },
  "Post-Apocalyptic": {
    label: "Post-Apocalyptic",
    slots: {
      Top: [
        { label: "Scrap Armor", promptHint: "makeshift armor from scrap metal and leather" },
        { label: "Torn Tank", promptHint: "torn and dirty tank top" },
        { label: "Salvaged Vest", promptHint: "patched-together tactical vest from salvaged gear" },
        { label: "Bandage Wrap", promptHint: "chest wrapped in dirty bandages and leather straps" },
      ],
      Bottom: [
        { label: "Patched Pants", promptHint: "heavily patched cargo pants" },
        { label: "Leather Chaps", promptHint: "worn leather chaps over torn jeans" },
        { label: "Wrapped Legs", promptHint: "legs wrapped in cloth and leather strips" },
        { label: "Tattered Skirt", promptHint: "asymmetric tattered skirt with belts" },
      ],
      Outerwear: [
        { label: "Wasteland Duster", promptHint: "long weathered duster coat with patches" },
        { label: "Tire Armor", promptHint: "shoulder armor made from tire rubber" },
        { label: "Hazmat Coat", promptHint: "modified hazmat coat" },
        { label: "Pelt Cloak", promptHint: "animal pelt cloak" },
      ],
      Footwear: [
        { label: "Wrapped Boots", promptHint: "boots wrapped in cloth and wire" },
        { label: "Tire Sandals", promptHint: "sandals made from tire rubber" },
        { label: "Military Surplus", promptHint: "battered military surplus boots" },
        { label: "Bare Feet", promptHint: "barefoot with callused feet" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Gas Mask", promptHint: "battered gas mask" },
        { label: "Welding Goggles", promptHint: "scratched welding goggles on forehead" },
        { label: "Skull Mask", promptHint: "animal skull worn as mask" },
        { label: "Wrapped Head", promptHint: "head wrapped in desert cloth" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Pipe Weapon", promptHint: "crude weapon made from pipes" },
        { label: "Spiked Gloves", promptHint: "fingerless gloves with metal spikes" },
        { label: "Necklace of Trophies", promptHint: "necklace of scavenged trinkets" },
        { label: "Canteen", promptHint: "dented metal canteen on belt" },
      ],
    },
  },
  Ninja: {
    label: "Ninja / Assassin",
    slots: {
      Top: [
        { label: "Shinobi Gi", promptHint: "dark shinobi gi with wrapped chest" },
        { label: "Assassin Tunic", promptHint: "fitted assassin tunic with hidden blade sheaths" },
        { label: "Shadow Vest", promptHint: "light shadow armor vest" },
        { label: "Clan Armor", promptHint: "clan-marked light armor with insignia" },
      ],
      Bottom: [
        { label: "Shinobi Pants", promptHint: "loose shinobi pants wrapped at ankles" },
        { label: "Stealth Leggings", promptHint: "form-fitting stealth leggings" },
        { label: "Hakama", promptHint: "dark hakama pants" },
        { label: "Wrapped Pants", promptHint: "cloth-wrapped ninja pants" },
      ],
      Outerwear: [
        { label: "Shadow Cloak", promptHint: "dark hooded shadow cloak" },
        { label: "Smoke Cape", promptHint: "short cape that disperses into smoke" },
        { label: "Shoulder Guard", promptHint: "single shoulder guard with clan symbol" },
        { label: "Haori", promptHint: "dark haori jacket" },
      ],
      Footwear: [
        { label: "Tabi Boots", promptHint: "split-toe tabi boots" },
        { label: "Wrapped Sandals", promptHint: "cloth-wrapped sandals for silent movement" },
        { label: "Shadow Shoes", promptHint: "soft-soled shadow shoes" },
        { label: "Armored Tabi", promptHint: "reinforced armored tabi boots" },
      ],
      Headwear: [
        { label: "None", promptHint: "" },
        { label: "Face Wrap", promptHint: "dark face-concealing wrap revealing only eyes" },
        { label: "Oni Mask", promptHint: "menacing oni half-mask" },
        { label: "Hood", promptHint: "deep assassin hood" },
        { label: "Tenugui", promptHint: "tied tenugui headband" },
      ],
      Accessories: [
        { label: "None", promptHint: "" },
        { label: "Katana", promptHint: "katana strapped across back" },
        { label: "Shuriken Pouch", promptHint: "shuriken pouch on thigh" },
        { label: "Kunai Set", promptHint: "kunai knives in chest bandolier" },
        { label: "Grapple Hook", promptHint: "retractable grapple hook at waist" },
      ],
    },
  },
};

export interface CharacterAppearance {
  // Core identity
  age: number;  // 0-100 maps to ~15-70 years
  genderPresentation: "masculine" | "feminine" | "androgynous";
  
  body: {
    height: number;      // 0-100
    build: number;       // 0-100 slim → muscular
    skinTone: string;
    posture: string;
  };
  face: {
    shape: number;       // 0-100 round → angular
    eyeShape: string;
    eyeColor: string;
    jawWidth: number;    // 0-100
    noseSize: number;    // 0-100
    lipFullness: number; // 0-100
  };
  hair: {
    style: string;
    color: string;
    facialHair: string;
  };
  clothing: Record<string, string>; // slot → "Category:Label"
  distinguishingMarks: string[];
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  age: 35,
  genderPresentation: "masculine",
  body: { height: 50, build: 50, skinTone: "medium", posture: "Upright" },
  face: { shape: 50, eyeShape: "Almond", eyeColor: "brown", jawWidth: 50, noseSize: 50, lipFullness: 50 },
  hair: { style: "Short Cropped", color: "dark-brown", facialHair: "Clean-Shaven" },
  clothing: {},
  distinguishingMarks: [],
};

// ── Appearance Presets ──
export interface AppearancePreset {
  name: string;
  description: string;
  appearance: Partial<CharacterAppearance>;
}

export const APPEARANCE_PRESETS: AppearancePreset[] = [
  {
    name: "Grizzled Veteran",
    description: "Weathered soldier with battle scars",
    appearance: {
      age: 55,
      genderPresentation: "masculine",
      body: { height: 60, build: 70, skinTone: "tan", posture: "Confident" },
      face: { shape: 75, eyeShape: "Deep-Set", eyeColor: "gray", jawWidth: 70, noseSize: 60, lipFullness: 30 },
      hair: { style: "Buzzcut", color: "silver", facialHair: "Stubble" },
      distinguishingMarks: ["Facial Scar", "Battle Scars"],
    },
  },
  {
    name: "Young Noble",
    description: "Aristocratic heir with refined features",
    appearance: {
      age: 22,
      genderPresentation: "androgynous",
      body: { height: 55, build: 35, skinTone: "fair", posture: "Upright" },
      face: { shape: 45, eyeShape: "Almond", eyeColor: "blue", jawWidth: 40, noseSize: 40, lipFullness: 50 },
      hair: { style: "Medium Wavy", color: "blonde", facialHair: "Clean-Shaven" },
      distinguishingMarks: [],
    },
  },
  {
    name: "Battle-Scarred Warrior",
    description: "Imposing fighter marked by combat",
    appearance: {
      age: 38,
      genderPresentation: "masculine",
      body: { height: 80, build: 85, skinTone: "dark-brown", posture: "Confident" },
      face: { shape: 80, eyeShape: "Hooded", eyeColor: "dark-brown", jawWidth: 75, noseSize: 65, lipFullness: 45 },
      hair: { style: "Bald", color: "black", facialHair: "Full Beard" },
      distinguishingMarks: ["Facial Scar", "Broken Nose", "Battle Scars"],
    },
  },
  {
    name: "Elegant Scholar",
    description: "Intellectual with refined presence",
    appearance: {
      age: 45,
      genderPresentation: "feminine",
      body: { height: 45, build: 30, skinTone: "porcelain", posture: "Upright" },
      face: { shape: 35, eyeShape: "Upturned", eyeColor: "green", jawWidth: 35, noseSize: 35, lipFullness: 55 },
      hair: { style: "Long Straight", color: "auburn", facialHair: "Clean-Shaven" },
      distinguishingMarks: ["Beauty Mark"],
    },
  },
  {
    name: "Street Tough",
    description: "Streetwise survivor with edge",
    appearance: {
      age: 28,
      genderPresentation: "masculine",
      body: { height: 50, build: 60, skinTone: "olive", posture: "Guarded" },
      face: { shape: 60, eyeShape: "Downturned", eyeColor: "hazel", jawWidth: 55, noseSize: 55, lipFullness: 40 },
      hair: { style: "Undercut", color: "black", facialHair: "Stubble" },
      distinguishingMarks: ["Neck Tattoo", "Facial Scar"],
    },
  },
  {
    name: "Mystic Sage",
    description: "Ancient wisdom keeper with piercing gaze",
    appearance: {
      age: 70,
      genderPresentation: "androgynous",
      body: { height: 40, build: 25, skinTone: "deep", posture: "Relaxed" },
      face: { shape: 55, eyeShape: "Deep-Set", eyeColor: "amber", jawWidth: 45, noseSize: 50, lipFullness: 35 },
      hair: { style: "Long Straight", color: "white", facialHair: "Braided Beard" },
      distinguishingMarks: ["Face Tattoo"],
    },
  },
];

// ── Validation ──
export interface AppearanceValidation {
  isValid: boolean;
  warnings: string[];
}

export function validateAppearance(appearance: CharacterAppearance): AppearanceValidation {
  const warnings: string[] = [];

  // Check for conflicting hair selections
  if (appearance.hair.style === "Bald" && appearance.hair.color && appearance.hair.color !== "black") {
    warnings.push("Hair color has no effect when Bald is selected");
  }

  // Check facial hair on feminine presentation
  if (
    appearance.genderPresentation === "feminine" &&
    appearance.hair.facialHair &&
    appearance.hair.facialHair !== "Clean-Shaven"
  ) {
    warnings.push("Facial hair selected with feminine presentation - this is unusual but valid");
  }

  // Check age vs distinguishing marks coherence
  if (appearance.age < 25 && appearance.distinguishingMarks.includes("Battle Scars")) {
    warnings.push("Battle scars on a young character may seem inconsistent");
  }

  // Check cybernetic marks on non-futuristic clothing
  const hasCyberneticMarks = appearance.distinguishingMarks.some(m => 
    m.includes("Cybernetic") || m.includes("Mechanical")
  );
  const hasFuturisticClothing = Object.values(appearance.clothing).some(v => 
    v?.startsWith("Cyberpunk:") || v?.startsWith("Futuristic:")
  );
  if (hasCyberneticMarks && !hasFuturisticClothing) {
    warnings.push("Cybernetic features without futuristic clothing - consider consistency");
  }

  return { isValid: warnings.length === 0, warnings };
}

// ── Prompt Builder ──
function getAgeDescriptor(age: number): string {
  const ageLabel = AGE_LABELS.find(a => age >= a.min && age <= a.max);
  return ageLabel?.descriptor || "adult";
}

function getHeightDescriptor(height: number): string {
  if (height < 20) return "very short";
  if (height < 40) return "short";
  if (height > 80) return "very tall";
  if (height > 60) return "tall";
  return "average height";
}

function getBuildDescriptor(build: number): string {
  if (build < 15) return "very slim";
  if (build < 30) return "slim";
  if (build < 45) return "lean";
  if (build < 60) return "athletic";
  if (build < 75) return "muscular";
  return "heavily muscular";
}

function getFaceDescriptor(shape: number): string {
  if (shape < 25) return "round soft face";
  if (shape < 45) return "oval face";
  if (shape < 65) return "defined features";
  if (shape < 85) return "angular face";
  return "chiseled angular face";
}

function getJawDescriptor(jawWidth: number): string {
  if (jawWidth < 30) return "narrow jaw";
  if (jawWidth > 70) return "strong square jaw";
  return ""; // average, don't mention
}

function getNoseDescriptor(noseSize: number): string {
  if (noseSize < 25) return "small delicate nose";
  if (noseSize < 45) return "refined nose";
  if (noseSize > 75) return "prominent nose";
  if (noseSize > 55) return "aquiline nose";
  return ""; // average
}

function getLipDescriptor(lipFullness: number): string {
  if (lipFullness < 30) return "thin lips";
  if (lipFullness > 70) return "full lips";
  return ""; // average
}

export function buildAppearancePrompt(appearance: CharacterAppearance): string {
  const parts: string[] = [];

  // 1. Gender presentation + age (highest weight for AI)
  const genderDesc = GENDER_PRESENTATIONS.find(g => g.value === appearance.genderPresentation)?.descriptor || "person";
  const ageDesc = getAgeDescriptor(appearance.age);
  parts.push(`${genderDesc} ${ageDesc}`);

  // 2. Ethnicity/skin tone
  const skinTone = SKIN_TONES.find(s => s.value === appearance.body.skinTone)?.label || appearance.body.skinTone;
  parts.push(`${skinTone.toLowerCase()} skin tone`);

  // 3. Build + height + posture
  const heightDesc = getHeightDescriptor(appearance.body.height);
  const buildDesc = getBuildDescriptor(appearance.body.build);
  const posture = appearance.body.posture?.toLowerCase() || "";
  const bodyParts = [heightDesc, buildDesc + " build"];
  if (posture && posture !== "upright") bodyParts.push(posture + " posture");
  parts.push(bodyParts.join(", "));

  // 4. Face shape + distinctive facial features
  const faceDesc = getFaceDescriptor(appearance.face.shape);
  const facialFeatures = [faceDesc];
  
  const jawDesc = getJawDescriptor(appearance.face.jawWidth);
  if (jawDesc) facialFeatures.push(jawDesc);
  
  const noseDesc = getNoseDescriptor(appearance.face.noseSize);
  if (noseDesc) facialFeatures.push(noseDesc);
  
  const lipDesc = getLipDescriptor(appearance.face.lipFullness);
  if (lipDesc) facialFeatures.push(lipDesc);
  
  parts.push(facialFeatures.join(", "));

  // 5. Eye shape + eye color
  const eyeColor = EYE_COLORS.find(c => c.value === appearance.face.eyeColor)?.label || appearance.face.eyeColor;
  parts.push(`${appearance.face.eyeShape.toLowerCase()} ${eyeColor.toLowerCase()} eyes`);

  // 6. Hair (style, color, length)
  if (appearance.hair.style === "Bald") {
    parts.push("bald head");
  } else {
    const hairColor = HAIR_COLORS.find(c => c.value === appearance.hair.color)?.label || appearance.hair.color;
    parts.push(`${appearance.hair.style.toLowerCase()} ${hairColor.toLowerCase()} hair`);
  }

  // 7. Facial hair
  if (appearance.hair.facialHair && appearance.hair.facialHair !== "Clean-Shaven") {
    parts.push(appearance.hair.facialHair.toLowerCase());
  }

  // 8. Clothing (most visible first: outerwear → top → bottom → accessories)
  const clothingOrder = ["Outerwear", "Top", "Bottom", "Footwear", "Headwear", "Accessories"];
  const clothingHints: string[] = [];
  
  for (const slot of clothingOrder) {
    const value = appearance.clothing[slot];
    if (!value) continue;
    const [catKey, itemLabel] = value.split(":");
    const cat = CLOTHING_CATEGORIES[catKey];
    if (!cat) continue;
    const items = cat.slots[slot];
    if (!items) continue;
    const item = items.find(i => i.label === itemLabel);
    if (item?.promptHint) clothingHints.push(item.promptHint);
  }
  
  if (clothingHints.length > 0) {
    // Build coherent outfit phrase
    parts.push("wearing " + clothingHints.join(", "));
  }

  // 9. Distinguishing marks
  if (appearance.distinguishingMarks.length > 0) {
    const marks = appearance.distinguishingMarks.map(m => m.toLowerCase()).join(", ");
    parts.push(`with ${marks}`);
  }

  return parts.join(", ");
}

// Helper to apply a preset
export function applyPreset(preset: AppearancePreset): CharacterAppearance {
  const base = { ...DEFAULT_APPEARANCE };
  const presetData = preset.appearance;
  
  return {
    age: presetData.age ?? base.age,
    genderPresentation: presetData.genderPresentation ?? base.genderPresentation,
    body: { ...base.body, ...presetData.body },
    face: { ...base.face, ...presetData.face },
    hair: { ...base.hair, ...presetData.hair },
    clothing: { ...base.clothing, ...presetData.clothing },
    distinguishingMarks: presetData.distinguishingMarks ?? base.distinguishingMarks,
  };
}
