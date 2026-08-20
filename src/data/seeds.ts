export type SeedType = "Feminized" | "Regular" | "Autoflower" | "Unknown Photo";

export type Seed = {
  id: string;
  name: string;
  breeder: string;
  type: SeedType;
  count?: number;
  lineage?: string;
  gender?: string;
  note?: string;
};

const inventory = `
Ethos Genetics|End Game #3 × Grandpa's Cookies #10|End Game #3 × Grandpa's Cookies #10|Feminized|3
Ethos Genetics|Durban Poison × Lilac Diesel #22|Durban Poison × Lilac Diesel #22|Feminized|11
Ethos Genetics|Uber Cherry|Not recorded|Feminized|3
Ethos Genetics|Temple Kush F2 × Temple of the Dog BX|Temple Kush F2 × Temple of the Dog BX|Regular|9
Ethos Genetics|Temple Kush F2 × California Black Rozé #10|Temple Kush F2 × California Black Rozé #10|Regular|9
Ethos Genetics|Quattro Kush F3 × OG Kush BX3|Quattro Kush F3 × OG Kush BX3|Regular|10
Ethos Genetics|CrescendØ #2 × Marshmallow OG|CrescendØ #2 × Marshmallow OG|Feminized|5
Ethos Genetics|Quattro Kush F3 × Zweet Inzanity|Quattro Kush F3 × Zweet Inzanity|Regular|10
Ethos Genetics|Temple Kush F2 × Mandarin Cookies R2 #7|Temple Kush F2 × Mandarin Cookies R2 #7|Regular|10
Ethos Genetics|Quattro Kush F3|Not recorded|Regular|10
Ethos Genetics|Cherry TK F2|Not recorded|Regular|5
Ethos Genetics|Grandpa's Cookies × End Game #5|Grandpa's Cookies × End Game #5|Feminized|5
Ethos Genetics|Quattro Kush F3 × Sour Diesel BX3|Quattro Kush F3 × Sour Diesel BX3|Regular|10
Ethos Genetics|End Game #5 S1|Not recorded|Feminized|5
Ethos Genetics|Grape Diamonds × Lilac Diesel BX3|Grape Diamonds × Lilac Diesel BX3|Feminized|8
Ethos Genetics|Grape Diamonds × End Game #5|Grape Diamonds × End Game #5|Feminized|5
Ethos Genetics|Quattro Kush F3 × Granddaddy Purple|Quattro Kush F3 × Granddaddy Purple|Regular|10
Ethos Genetics|Temple Kush F2 × Zkittlez BX1|Temple Kush F2 × Zkittlez BX1|Regular|10
Ethos Genetics|Fruity Pebbles OG × Lilac Diesel BX3|Fruity Pebbles OG × Lilac Diesel BX3|Regular|10
Ethos Genetics|Lemon Cherry Gelato × SVF OG|Lemon Cherry Gelato × SVF OG|Feminized|3
Ethos Genetics|CrescendØ #2 × Cherry Pie|CrescendØ #2 × Cherry Pie|Feminized|5
Ethos Genetics|Temple Kush F2 × Blueberry Muffin Bubba|Temple Kush F2 × Blueberry Muffin Bubba|Regular|10
Ethos Genetics|Granddaddy Purple × Quattro Kush|Granddaddy Purple × Quattro Kush|Regular|3
Ethos Genetics|Permanent Marker × OG Kush BX4|Permanent Marker × OG Kush BX4|Regular|3
Ethos Genetics|Blueberry Cookies × MCV3|Blueberry Cookies × MCV3|Feminized|3
Ethos Genetics|Tropical Cherry × Marshmallow OG|Tropical Cherry × Marshmallow OG|Feminized|3
Ethos Genetics|White Wedding × Zweet OG|White Wedding × Zweet OG|Feminized|3
Ethos Genetics|All the Sauces R1|Not recorded|Feminized|5
Ethos Genetics|CrescendØ #2 × End Game #3|CrescendØ #2 × End Game #3|Feminized|5
Ethos Genetics|Wrank × End Game|Wrank × End Game|Feminized|5
Ethos Genetics|Spanish Moon × Grandpa's Stash #12|Spanish Moon × Grandpa's Stash #12|Feminized|5
Ethos Genetics|Lilac Diesel BX3|Not recorded|Regular|10
Ethos Genetics|Temple Kush F2 × Peach CrescendØ #2|Temple Kush F2 × Peach CrescendØ #2|Regular|10
Ethos Genetics|Peach CrescendØ F1 × Grandpa's Stash #12|Peach CrescendØ F1 × Grandpa's Stash #12|Feminized|5
Ethos Genetics|Temple Kush F2 × Purple Zkittlez|Temple Kush F2 × Purple Zkittlez|Regular|10
Ethos Genetics|Punch Line RBX × Grandpa's Stash #12|Punch Line RBX × Grandpa's Stash #12|Regular|5
Ethos Genetics|Purple Sunset × Lilac Diesel BX3|Purple Sunset × Lilac Diesel BX3|Regular|10
Ethos Genetics|Quattro Kush F3 × Purple Majik #10|Quattro Kush F3 × Purple Majik #10|Regular|10
Ethos Genetics|Apples & Bananas Auto|Not recorded|Autoflower|4
Ethos Genetics|CrescendØ #16 × SVF OG|CrescendØ #16 × SVF OG|Feminized|5
Ethos Genetics|Super Lemon Haze × Zweet Auto|Super Lemon Haze × Zweet Auto|Autoflower|3
Ethos Genetics|CrescendØ #2 × End Game #5|CrescendØ #2 × End Game #5|Feminized|5
Ethos Genetics|Temple Kush F3|Not recorded|Regular|10
Ethos Genetics|GMO Cookies × Lilac Diesel BX3|GMO Cookies × Lilac Diesel BX3|Regular|10
Ethos Genetics|Grandpa's Stash #6 × End Game #5|Grandpa's Stash #6 × End Game #5|Feminized|5
Ethos Genetics|10th Planet × Grandpa's Stash #12|10th Planet × Grandpa's Stash #12|Feminized|5
Ethos Genetics|XXX #20 × End Game #5|XXX #20 × End Game #5|Feminized|5
Ethos Genetics|Temple Kush F2 × CrescendØ #16|Temple Kush F2 × CrescendØ #16|Regular|10
Ethos Genetics|Temple Kush F2|Not recorded|Regular|10
Ethos Genetics|NYCD × Lilac Diesel BX3|NYCD × Lilac Diesel BX3|Regular|10
Ethos Genetics|End Game R2 × Grandpa's Stash #12|End Game R2 × Grandpa's Stash #12|Feminized|5
Ethos Genetics|High Note R1|Not recorded|Feminized|3
Ethos Genetics|Temple Kush F2 × Heirloom Purple|Temple Kush F2 × Heirloom Purple|Regular|10
Ethos Genetics|Banana RF7 Auto|Not recorded|Autoflower|3
Ethos Genetics|CrescendØ #6 × Lilac Diesel BX3|CrescendØ #6 × Lilac Diesel BX3|Regular|10
Ethos Genetics|Pina #5 × Zweet Auto|Pina #5 × Zweet Auto|Autoflower|3
Ethos Genetics|Quattro Kush F3 × Lilac Diesel|Quattro Kush F3 × Lilac Diesel|Regular|10
Ethos Genetics|CrescendØ #2 × SVF OG|CrescendØ #2 × SVF OG|Feminized|5
Ethos Genetics|Temple Kush F2 × Wedding Cake|Temple Kush F2 × Wedding Cake|Regular|10
Ethos Genetics|CrescendØ #16 × Tahoe OG|CrescendØ #16 × Tahoe OG|Feminized|5
Ethos Genetics|Temple Kush F2 × CrescendØ #6|Temple Kush F2 × CrescendØ #6|Regular|10
Ethos Genetics|Original CrescendØ × Grandpa's Stash #12|Original CrescendØ × Grandpa's Stash #12|Feminized|5
Ethos Genetics|Temple Kush F2 × OG D Lux|Temple Kush F2 × OG D Lux|Regular|10
Ethos Genetics|Lilac Diesel Auto × Zweet Auto|Lilac Diesel Auto × Zweet Auto|Autoflower|4
Ethos Genetics|Banana Hammock × Lilac Diesel #22|Banana Hammock × Lilac Diesel #22|Feminized|4
Ethos Genetics|Jealousy × Banana Daddy Auto|Jealousy × Banana Daddy Auto|Autoflower|2
Ethos Genetics|Josh D OG BX3|Not recorded|Regular|20
Ethos Genetics|Krux × Grandpa's Cookies #6|Krux × Grandpa's Cookies #6|Feminized|2
Ethos Genetics|Grape Diamonds × Grandpa's Cookies #6|Grape Diamonds × Grandpa's Cookies #6|Feminized|2
Ethos Genetics|Grandpa's Cookies #3 × Josh D OG BX3|Grandpa's Cookies #3 × Josh D OG BX3|Regular|20
Ethos Genetics|Lilac Diesel × Pineapple Runtz Auto|Lilac Diesel × Pineapple Runtz Auto|Autoflower|2
Ethos Genetics|Cap Junkie × End Game #3|Cap Junkie × End Game #3|Feminized|9
Ethos Genetics|Blueberry Cookies|Not recorded|Feminized|2
Ethos Genetics|Wrotten Fruit|Not recorded|Feminized|10
Ethos Genetics|Auto V5 × Homogenous|Auto V5 × Homogenous|Autoflower|4
Ethos Genetics|Skunk Hero × Oaksterdam OG|Skunk Hero × Oaksterdam OG|Feminized|4
Ethos Genetics|Full Throttle Wedding|Not recorded|Feminized|8
Ethos Genetics|CrescendØ #16 × Grandpa's Cookies #10|CrescendØ #16 × Grandpa's Cookies #10|Feminized|6
Ethos Genetics|Wrank S1|Wrank #5 × Wrank #5|Feminized|5
Ethos Genetics|M.C. Nuggets|Martian Candy OG × Wrank #5|Feminized|5
Ethos Genetics|Rocket Queen|Jet Fuel × Wrank #5|Feminized|5
Ethos Genetics|Sprinkles|Dip n' Stax × Wrank #5|Feminized|5
Ethos Genetics|Purple Nasty|Lemon Cherry Pie × Wrank #5|Feminized|5
Ethos Genetics|Dirty Banana|Banana Hammock Auto F1 × Wrank #5|Feminized|5
Ethos Genetics|Cherry Punch × Lilac Diesel #22|Cherry Punch × Lilac Diesel #22|Feminized|5
Ethos Genetics|Grandpa's Stash × Lilac Diesel #22|Grandpa's Stash × Lilac Diesel #22|Feminized|5
Ethos Genetics|White Wedding × Lilac Diesel #22|White Wedding × Lilac Diesel #22|Feminized|5
Ethos Genetics|Lemon Berry Candy OG × Lilac Diesel #22|Lemon Berry Candy OG × Lilac Diesel #22|Feminized|5
Ethos Genetics|Mandarin Cookies × Lilac Diesel #22|Mandarin Cookies × Lilac Diesel #22|Feminized|5
Ethos Genetics|Piña Colada|Piña × Banana Hammock|Autoflower|5
Ethos Genetics|My Thai|Purple Thai × Banana Hammock|Autoflower|5
Ethos Genetics|Banana Split|Banana Daddy × Banana Hammock|Autoflower|5
Ethos Genetics|Bello y Dulce|(Zweet × Piña) × Piña|Autoflower|5
Ethos Genetics|Deliziosa|(Lilac Diesel × Piña) × Piña|Autoflower|5
Ethos Genetics|Piña Pequeña|Runtz Auto × Piña|Autoflower|5
Ethos Genetics|Trop Cherry Duet|Two cultivar identities/lineages not yet recorded|Feminized|10
Ethos Genetics|10th Planet R1|Not recorded|Feminized|10
Ethos Genetics|Pepe Silvia R1|Not recorded|Feminized|10
Ethos Genetics|Liqueur R1|Not recorded|Feminized|10
Ethos Genetics|Orange Velvet Underground RBx|Not recorded|Feminized|10
Ethos Genetics|GEN 1 Duet|Two cultivar identities/lineages not yet recorded|Feminized|10
Ethos Genetics|Purple Sunset RBx2|Not recorded|Feminized|10
Ethos Genetics|Grape Balls of Fire RBx|Not recorded|Feminized|5
Ethos Genetics|Zoap Duet|Two cultivar identities/lineages not yet recorded|Feminized|10
Ethos Genetics|Planet of the Grapes Auto|Not recorded|Autoflower|10
Ethos Genetics|Mandarin Zkittlez R1|Not recorded|Feminized|10
Ethos Genetics|Chama|Lemon Cherry Pie × Martian Candy OG|Feminized|5
Ethos Genetics|Purple Nasty × Martian Candy OG|Purple Nasty (aka Lemon Cherry Pie #7) × Martian Candy OG|Feminized|5
Ethos Genetics|Whiskey OG × Martian Candy OG|Whiskey OG (aka Lemon Cherry Pie #8) × Martian Candy OG|Feminized|5
Ethos Genetics|Original Z RBX|All the Sauces × Original Z|Feminized|5
Ethos Genetics|Big Fruity|Original Z × Wrank|Feminized|5
Ethos Genetics|Lemon Cherry Pie × Original Z|Lemon Cherry Pie × Original Z|Feminized|5
Ethos Genetics|Rainbow Haze|Lemon Cherry Pie #4 × Original Z|Feminized|5
Ethos Genetics|Rocket Queen × Original Z|Rocket Queen × Original Z|Feminized|5
Ethos Genetics|Chama × Original Z|Chama × Original Z|Feminized|5
Ethos Genetics|Double Daddy Auto|Banana Daddy Auto × Banana Daddy Auto|Autoflower|5
Binchickens Genetics|Banksia Tar Kush F2 #9|Not recorded|Regular|20
Binchickens Genetics|Banksia Tar Kush F2 #14|Not recorded|Regular|17
Binchickens Genetics|Banksia Tar Kush F2 #6|Not recorded|Regular|35
Binchickens Genetics|Banksia Tar Kush V1|Not recorded|Regular|25
Binchickens Genetics|Dog Downunder ABC|Not recorded|Regular|18
Binchickens Genetics|Wombat Breath ABC|Not recorded|Regular|16
Binchickens Genetics|Deep Chunk|Not recorded|Regular|23
Binchickens Genetics|Ol Betsy × Chem91 × Deep Chunk|Ol Betsy × Chem91 × Deep Chunk|Regular|17
Terpyz Mutant Genetics|Mentha de Croco|Not recorded|Regular|12
Terpyz Mutant Genetics|Quackberry Rose|Not recorded|Regular|12
Terpyz Mutant Genetics|Bubblegum GPP|Not recorded|Regular|6
Terpyz Mutant Genetics|Feral Fuel ABC|Not recorded|Regular|13
Black Leaf Genetics|Frozen Baller|Not recorded|Feminized|2
Black Leaf Genetics|Yeti Blast|Not recorded|Feminized|2
Black Leaf Genetics|Hash Bar|Not recorded|Feminized|2
Black Leaf Genetics|Pink Nectar|Not recorded|Feminized|2
Black Leaf Genetics|Ice Rock Candy|Not recorded|Feminized|2
Black Leaf Genetics|Frozen Bag S1|Not recorded|Feminized|3
Humboldt Seed Company|Garlic Budder|Not recorded|Feminized|5
Humboldt Seed Company|Sapphire OG|Not recorded|Feminized|5
Humboldt Seed Company|Gorilla Breath|Not recorded|Feminized|1
Humboldt Seed Company|Sugar Breath|Not recorded|Feminized|1
In-House Genetics|Random Platinum Cross|Not recorded|Regular|4
In-House Genetics|Slurricane #44 RBX|Not recorded|Feminized|3
In-House Genetics|GG #4 × Black Cherry Smoothie|GG #4 × Black Cherry Smoothie|Feminized|21
In-House Genetics|ZoFire|Not recorded|Feminized|19
In-House Genetics|Garlic Fusion|Not recorded|Feminized|12
In-House Genetics|Slurricane #7 S1|Not recorded|Feminized|12
WolfPack Selections|Fruit Funk|GMO × Guava Biscotti|Feminized|6
Happy Valley Genetics|Game Over|Not recorded|Feminized|10
Happy Valley Genetics|End Game #3 S1|Not recorded|Feminized|6
Brothers Grimm|Bubble's Blueberry F4|Not recorded|Feminized|18
Brothers Grimm|Ricky's Hash Plant|Not recorded|Feminized|20
Brothers Grimm|Julian's Black Tee Tangie|Not recorded|Feminized|20
Greenspace AU|Heavy Bud|Not recorded|Feminized|5
Greenspace AU|Super Bud|Not recorded|Feminized|5
Greenspace AU|Exodus Cheese|Not recorded|Feminized|5
Greenspace AU|Mango Smile Auto|Not recorded|Autoflower|3
Rare Dankness|Ghost Train Haze #1|Ghost OG × Nevil's Wreck|Feminized|5
7 East Genetics|Freaks of Dank|Not recorded|Regular|20
7 East Genetics|Palestinian Princess F2|Not recorded|Regular|15
7 East Genetics|Lebanese Dragon BX1|Not recorded|Regular|15
7 East Genetics|Legend of Laos|Not recorded|Regular|15
7 East Genetics|Blueberry Bastard F4|Not recorded|Regular|15
7 East Genetics|Purple Dragon Balls F5|Not recorded|Regular|15
G13 Labs (breeder unverified)|Cheeselicious|Not recorded|Feminized|3
Greenspace AU / G13 Labs banner|Pineapple Express × Runtz 13|Pineapple Express × Runtz 13|Feminized|3
Unknown / Burn Pile|Amnesia Haze Auto|Not recorded|Autoflower|4
Unknown / Burn Pile|Black Domina Auto|Not recorded|Autoflower|4
Unknown / Burn Pile|CBD White Widow Auto|Not recorded|Autoflower|3
Unknown / Burn Pile|Northern Lights Auto|Not recorded|Autoflower|2
Unknown / Burn Pile|Special Lime Haze Auto|Not recorded|Autoflower|2
Unknown / Burn Pile|Purple Glam Kush Auto|Not recorded|Autoflower|2
Unknown / Burn Pile|Zkittlez Auto|Not recorded|Autoflower|1
Unknown / Burn Pile|White Widow Auto|Not recorded|Autoflower|5
Unknown / Burn Pile|Moby Dick Auto|Not recorded|Autoflower|5
Unknown / Burn Pile|Kali's Mystery Auto|Not recorded|Autoflower|2
Unknown / Burn Pile|Durban Poison Auto|Not recorded|Autoflower|2
Unknown / Burn Pile|Gorilla Glue Auto|Not recorded|Autoflower|5
Unknown / Burn Pile|Psychedelic (LSD) Auto|Not recorded|Autoflower|3
Unknown / Burn Pile|Master Grand Kush Auto|Not recorded|Autoflower|3
Unknown / Burn Pile|White Widow|Not recorded|Feminized|5
Unknown / Burn Pile|Alien OG|Not recorded|Feminized|4
Unknown / Burn Pile|Afghan|Not recorded|Feminized|4
Unknown / Burn Pile|Jack Herer|Not recorded|Autoflower|3
Silly Wonka's Golden Beans / Ethos|Pocket Kingz (Cowboyz)|Not recorded|Feminized|6
Silly Wonka's Golden Beans / Ethos|Rozé Cookie Dough|Not recorded|Feminized|25
Silly Wonka's Golden Beans / Ethos|Rainmaker RBx|Not recorded|Feminized|5
Unknown / Brotanical Gardens freebie|Animal Mintz Auto|Animal Cookies × SinMint Cookies|Autoflower|7
Ethos Genetics|Atomic Fuego R1|Not recorded|Feminized|10
Ethos Genetics|Pluto Cut Autoflower RF3|Not recorded|Autoflower|50
Ethos Genetics|Z Cut RBX2|All the Sauces × Original Z|Feminized|5
Ethos Genetics|Fuego'Z R1|Funky Fuego #7 × Original Z|Feminized|10
Ethos Genetics|Atomic Leisure R1|Martian Candy OG × Original Z|Feminized|5
Ethos Genetics|Rocket Queen'Z R1|Rocket Queen × Original Z|Feminized|5
Ethos Genetics|Rainbow Pie R1|Lemon Cherry Pie × Original Z|Feminized|5
Ethos Genetics|Grape Fruity R1|Wrank #8 × Original Z|Feminized|5
Ethos Genetics|Lilac Diesel BX1|Not recorded|Feminized|3
Ethos Genetics|CrescendØ #16 × Strawberry OG Cookies|CrescendØ #16 × Strawberry OG Cookies|Feminized|2
Ethos Genetics|Punch n Pie|Not recorded|Feminized|12
Da Skreets / Ethos|Cookie Flake|ETHOS Cookies #16 × Grandpa's Cookies #6|Feminized|5
In-House Genetics|PNW Cherries|Not recorded|Feminized|13
In-House Genetics|Tahoe Snow|Not recorded|Feminized|13
In-House Genetics|GASper|Not recorded|Feminized|12
In-House Genetics|Crystal Cookies V2|Not recorded|Feminized|13
In-House Genetics|Frozen Grapes|Not recorded|Feminized|13
In-House Genetics|Grunge|GG #4 × OGKB V2.1|Feminized|7
In-House Genetics|Platinum Kush Breath|Not recorded|Feminized|13
In-House Genetics|Deluxe Sugar Cane|Not recorded|Feminized|12
In-House Genetics|Platinumz|Not recorded|Feminized|13
In-House Genetics|Platinum Kush Breath Remix|Not recorded|Feminized|13
In-House Genetics|Bifrost|Not recorded|Feminized|13
In-House Genetics|Sour Urkle|Sour D × Purple Urkle|Feminized|5
Unverified / Mystery Mountain medical flower|Peanut Butter Souffle bagseed|Not recorded|Unknown/unsexed|1
LandraceWarden / Overgrow|Gilgit Purple|Not recorded|Regular|10
LandraceWarden / Overgrow|Kalat Balochistan|Not recorded|Regular|10
Shoreline / Overgrow|Death Star bx2|Not recorded|Regular|10
Shoreline / Overgrow|Golden Goat bx2|Not recorded|Regular|10
Shoreline / Overgrow|Sour D|Not recorded|Regular|10
Le_Rat / Overgrow|Blue Biskawit|Oreoz × Blue Afghani|Gender TBD|10
Choctaw / Overgrow|Alien Daydream|Splinter7 female (Choclit Zulu × Lemon Alien) × Bodhi SSDD F2|Gender TBD|10
Humboldt Seed Company|California Octane|Not recorded|Feminized|10
Akamai / Overgrow|Snow Lotus IBL|Not recorded|Regular|TBD
Akamai / Overgrow|Lavender Boogie F4|Not recorded|Regular|TBD
Akamai / Overgrow|Wolf Pack F3|Not recorded|Regular|TBD
SDA / Overgrow|Black Domina|Not recorded|Gender TBD|TBD
SDA / Overgrow|Williams Wonder|Not recorded|Gender TBD|TBD
SDA / Overgrow|Wizard's Cherry Pie|Not recorded; formerly labelled Poison GDP F1|Gender TBD|TBD
Overgrow tester allocation; final maker TBD|(Coast 2 Coast × Dank Side of the Moon) × Double Truffle OG|[(Gorilla Butter × Oreoz) × (Morning Vibes × Hell on Wheels)] × (Godfather OG × Double Truffle Shuffle)|Gender TBD|TBD
sd9007 / Overgrow|Karma Sour Diesel × Rez Sour Diesel F2|Karma Sour Diesel × Rez Sour Diesel F2|Regular|TBD
sd9007 / Overgrow|Santa Marta Colombian Gold 2025|Not recorded|Gender TBD|TBD
sd9007 / Overgrow|Blue Fury × Freakshow BX|Blue Fury × Freakshow BX|Gender TBD|TBD
Hashpants / sd9007 / Overgrow|CSD S1|Boston Clone Company CSD clone × self; CSD expansion unverified|Feminized|TBD
`.trim();

const toSeedType = (gender: string): SeedType => {
  if (gender === "Feminized" || gender === "Regular" || gender === "Autoflower") return gender;
  return "Unknown Photo";
};

export const SEEDS: Seed[] = inventory.split("\n").map((row, index) => {
  const [breeder, name, lineage, gender, countText] = row.split("|");
  const parsedCount = Number.parseInt(countText, 10);

  return {
    id: `vault-${index + 1}-${breeder}-${name}`,
    breeder,
    name,
    lineage,
    gender,
    type: toSeedType(gender),
    count: Number.isFinite(parsedCount) ? parsedCount : 0,
    note: lineage === "Not recorded" ? undefined : `Lineage: ${lineage}`,
  };
});

export const DEFAULT_SEED_COUNTS: Record<string, number> = Object.fromEntries(
  SEEDS.map((seed) => [seed.id, seed.count ?? 0]),
);

export const BREEDERS = [...new Set(SEEDS.map((seed) => seed.breeder))];

export const VAULT_TOTALS = BREEDERS.map((breeder) => ({
  breeder,
  total: SEEDS.filter((seed) => seed.breeder === breeder).reduce((sum, seed) => sum + (seed.count ?? 0), 0),
}));

export const VAULT_TYPE_TOTALS = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as const).map((type) => ({
  type,
  total: SEEDS.filter((seed) => seed.type === type).reduce((sum, seed) => sum + (seed.count ?? 0), 0),
  strains: SEEDS.filter((seed) => seed.type === type).length,
}));

export const MAIN_VAULT_TOTAL = SEEDS.filter((seed) => seed.breeder !== "Unknown / Burn Pile").reduce(
  (sum, seed) => sum + (seed.count ?? 0),
  0,
);
export const BURN_PILE_TOTAL = SEEDS.filter((seed) => seed.breeder === "Unknown / Burn Pile").reduce(
  (sum, seed) => sum + (seed.count ?? 0),
  0,
);
export const GRAND_TOTAL = MAIN_VAULT_TOTAL + BURN_PILE_TOTAL;
