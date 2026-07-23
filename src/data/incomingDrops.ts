export type IncomingDrop = {
  breeder: string;
  cultivar: string;
  type: string;
  count: number;
};

export const INCOMING_DROPS: IncomingDrop[] = [
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Pocket Kingz (Cowboyz)", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Rainmaker RBx", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Rozé Cookie Dough", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "The R3 Project", type: "Feminized", count: 3 },
  { breeder: "Ethos Genetics", cultivar: "Wrank Multipack", type: "Feminized Multipack", count: 30 },
  { breeder: "Ethos Genetics", cultivar: "Tropical Thunder Auto Multipack", type: "Feminized Autoflower Multipack", count: 30 },
  { breeder: "Ethos Genetics", cultivar: "10th Planet R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "GEN 1 Duet", type: "Feminized Duet", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Zoap Duet", type: "Feminized Duet", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Trop Cherry Duet", type: "Feminized Duet", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Pepe Silvia R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Lilac Diesel #22 Multipack", type: "Feminized Multipack", count: 30 },
  { breeder: "Ethos Genetics", cultivar: "Planet Of The Grapes Auto", type: "Feminized Autoflower", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Liqueur R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Orange Velvet Underground RBx", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Mandarin Zkittlez R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Grape Balls Of Fire RBx", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Bananium", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Big Drip", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Garlic Fusion Gold Pack", type: "Feminized", count: 15 },
  { breeder: "In House Genetics", cultivar: "Hot Sauce", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Magenta OG", type: "Feminized", count: 6 },
  { breeder: "In House Genetics", cultivar: "Platinum Valley", type: "Feminized", count: 5 },
  { breeder: "Da Skreets", cultivar: "Runtz S1", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "PNW Cherries", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Tahoe Snow", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "GASper", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Crystal Cookies V2", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Frozen Grapes", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Chama", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Purple Nasty × Martian Candy OG", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Whiskey OG × Martian Candy OG", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Original Z RBX", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Fuego'Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Big Fruity", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Lemon Cherry Pie × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Rainbow Haze", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Rocket Queen × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Chama × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Double Daddy Auto", type: "Feminized Autoflower", count: 5 },
];

export const INCOMING_DROP_TOTAL = INCOMING_DROPS.reduce((total, drop) => total + drop.count, 0);
export const INCOMING_DROP_BREEDER_TOTAL = new Set(INCOMING_DROPS.map((drop) => drop.breeder)).size;
