export const PLAYER_LEAGUES = [
  {
    name: "Carnívoras",
    rows: [
      {
        place: 1,
        alias: "Clorofila",
        fighter: "Venus Real",
        wins: 12,
        sponsor: "NitroGlow",
        prize: "Fertilizante de campeonato",
      },
      {
        place: 2,
        alias: "Boca Verde",
        fighter: "Drosera Fina",
        wins: 9,
        sponsor: "Titan Pro",
        prize: "Maceta de fibra de carbono",
      },
      {
        place: 3,
        alias: "Savia Roja",
        fighter: "Nepente Baja",
        wins: 7,
        sponsor: "Aurora Labs",
        prize: "Sustrato luminoso",
      },
    ],
  },
  {
    name: "Cactus",
    rows: [
      {
        place: 1,
        alias: "Raíz Oscura",
        fighter: "Cactus Espectral",
        wins: 11,
        sponsor: "Titan Pro",
        prize: "Espinas de exhibición",
      },
      {
        place: 2,
        alias: "Seco Letal",
        fighter: "Nopal de Ring",
        wins: 8,
        sponsor: "NitroGlow",
        prize: "Maceta de arena negra",
      },
      {
        place: 3,
        alias: "Pincho",
        fighter: "Cardón Bravo",
        wins: 6,
        sponsor: "Aurora Labs",
        prize: "Riego de desierto",
      },
    ],
  },
  {
    name: "Suculentas",
    rows: [
      {
        place: 1,
        alias: "Jade",
        fighter: "Echeveria de Oro",
        wins: 10,
        sponsor: "Aurora Labs",
        prize: "Sustrato mineral",
      },
      {
        place: 2,
        alias: "Roseta",
        fighter: "Sedum Corto",
        wins: 7,
        sponsor: "NitroGlow",
        prize: "Luz de cultivo",
      },
      {
        place: 3,
        alias: "Hoja Gorda",
        fighter: "Crásula Roja",
        wins: 5,
        sponsor: "Titan Pro",
        prize: "Maceta de barro",
      },
    ],
  },
  {
    name: "Palmera",
    rows: [
      {
        place: 1,
        alias: "Sombra Alta",
        fighter: "Palma de Arena",
        wins: 9,
        sponsor: "Titan Pro",
        prize: "Fibra de tronco",
      },
      {
        place: 2,
        alias: "Coco",
        fighter: "Datilera de Ring",
        wins: 6,
        sponsor: "NitroGlow",
        prize: "Riego profundo",
      },
      {
        place: 3,
        alias: "Brisa",
        fighter: "Areca Fina",
        wins: 4,
        sponsor: "Aurora Labs",
        prize: "Maceta alta",
      },
    ],
  },
  {
    name: "Selva",
    rows: [
      {
        place: 1,
        alias: "Verde Letal",
        fighter: "Helecho Real",
        wins: 13,
        sponsor: "Aurora Labs",
        prize: "Cúpula húmeda",
      },
      {
        place: 2,
        alias: "Hoja Ancha",
        fighter: "Monstera Imperial",
        wins: 10,
        sponsor: "NitroGlow",
        prize: "Tutor de liana",
      },
      {
        place: 3,
        alias: "Musgo",
        fighter: "Philodendro Bravo",
        wins: 8,
        sponsor: "Titan Pro",
        prize: "Sustrato de selva",
      },
    ],
  },
  {
    name: "Flores de jardín",
    rows: [
      {
        place: 1,
        alias: "Pétalo",
        fighter: "Rosa de Maceta",
        wins: 8,
        sponsor: "NitroGlow",
        prize: "Tijera de campeonato",
      },
      {
        place: 2,
        alias: "Jardín",
        fighter: "Dalia Fuerte",
        wins: 6,
        sponsor: "Aurora Labs",
        prize: "Tierra negra",
      },
      {
        place: 3,
        alias: "Corola",
        fighter: "Lirio Bajo",
        wins: 4,
        sponsor: "Titan Pro",
        prize: "Maceta esmaltada",
      },
    ],
  },
] as const;

export function championOfLeagues() {
  let winner: {
    league: string;
    alias: string;
    fighter: string;
    wins: number;
  } | null = null;
  for (const league of PLAYER_LEAGUES) {
    for (const row of league.rows) {
      if (!winner || row.wins > winner.wins) {
        winner = {
          league: league.name,
          alias: row.alias,
          fighter: row.fighter,
          wins: row.wins,
        };
      }
    }
  }
  return winner;
}

export const TEAM_RANKING = [
  {
    place: 1,
    name: "Invernadero Norte",
    members: "Clorofila · Verde Letal",
    wins: 21,
    sponsor: "NitroGlow",
    prize: "Cúpula de vidrio",
  },
  {
    place: 2,
    name: "Maceta Brava",
    members: "Raíz Oscura · Tallo Feroz",
    wins: 16,
    sponsor: "Titan Pro",
    prize: "Banco de sustrato",
  },
  {
    place: 3,
    name: "Raíces Unidas",
    members: "Helecho Real · Pétalo Duro",
    wins: 11,
    sponsor: "Aurora Labs",
    prize: "Riego de campeonato",
  },
] as const;
