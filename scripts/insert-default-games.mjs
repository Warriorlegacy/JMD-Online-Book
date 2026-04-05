import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const defaultGames = [
  // Sports Games
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Cricket Match Betting",
    provider: "JMD Sports",
    category: "sports",
    thumbnail_url: "/games/cricket.jpg",
    launch_url: "/games/cricket",
    description: "Bet on live cricket matches, player performances, and match outcomes",
    is_active: true,
    is_featured: true,
    is_hot: true,
    sort_order: 1,
    min_bet: 10,
    max_bet: 100000,
    tags: ["cricket", "live", "international", "ipl", "odi", "t20"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Football Match Betting",
    provider: "JMD Sports",
    category: "sports",
    thumbnail_url: "/games/football.jpg",
    launch_url: "/games/football",
    description: "Bet on football matches, goals, cards, and match results",
    is_active: true,
    is_featured: true,
    is_hot: true,
    sort_order: 2,
    min_bet: 10,
    max_bet: 100000,
    tags: ["football", "soccer", "premier-league", "champions-league", "bundesliga"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Tennis Championship",
    provider: "JMD Sports",
    category: "sports",
    thumbnail_url: "/games/tennis.jpg",
    launch_url: "/games/tennis",
    description: "Bet on professional tennis tournaments and player matches",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 3,
    min_bet: 10,
    max_bet: 50000,
    tags: ["tennis", "atp", "wta", "grand-slam", "wimbledon"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Basketball NBA",
    provider: "JMD Sports",
    category: "sports",
    thumbnail_url: "/games/basketball.jpg",
    launch_url: "/games/basketball",
    description: "Bet on NBA games, player stats, and championship outcomes",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 4,
    min_bet: 10,
    max_bet: 50000,
    tags: ["basketball", "nba", "player-stats", "championship"],
    play_count: 0,
  },

  // Casino Games
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Andar Bahar",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/andar-bahar.jpg",
    launch_url: "/games/andar-bahar",
    description: "Classic Indian card game with fast-paced action",
    is_active: true,
    is_featured: true,
    is_hot: true,
    sort_order: 5,
    min_bet: 10,
    max_bet: 25000,
    tags: ["andar-bahar", "cards", "indian", "fast", "popular"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Teen Patti",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/teen-patti.jpg",
    launch_url: "/games/teen-patti",
    description: "Traditional Indian poker game with exciting gameplay",
    is_active: true,
    is_featured: true,
    is_hot: true,
    sort_order: 6,
    min_bet: 10,
    max_bet: 25000,
    tags: ["teen-patti", "poker", "indian", "traditional", "classic"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Dragon Tiger",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/dragon-tiger.jpg",
    launch_url: "/games/dragon-tiger",
    description: "Simple and exciting card comparison game",
    is_active: true,
    is_featured: false,
    is_hot: true,
    sort_order: 7,
    min_bet: 10,
    max_bet: 25000,
    tags: ["dragon-tiger", "cards", "simple", "fast-action"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "Baccarat",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/baccarat.jpg",
    launch_url: "/games/baccarat",
    description: "Elegant casino card game with high stakes",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 8,
    min_bet: 100,
    max_bet: 100000,
    tags: ["baccarat", "high-stakes", "elegant", "casino-classic"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Roulette",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/roulette.jpg",
    launch_url: "/games/roulette",
    description: "Classic wheel game with multiple betting options",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 9,
    min_bet: 10,
    max_bet: 50000,
    tags: ["roulette", "wheel", "casino-classic", "numbers"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Blackjack",
    provider: "JMD Casino",
    category: "casino",
    thumbnail_url: "/games/blackjack.jpg",
    launch_url: "/games/blackjack",
    description: "Strategic card game against the dealer",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 10,
    min_bet: 10,
    max_bet: 25000,
    tags: ["blackjack", "strategy", "cards", "dealer"],
    play_count: 0,
  },

  // Lottery Games
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "Daily Lottery",
    provider: "JMD Lottery",
    category: "lottery",
    thumbnail_url: "/games/daily-lottery.jpg",
    launch_url: "/games/daily-lottery",
    description: "Daily lottery draws with multiple prize tiers",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 11,
    min_bet: 10,
    max_bet: 1000,
    tags: ["lottery", "daily", "numbers", "jackpot"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Weekly Mega Jackpot",
    provider: "JMD Lottery",
    category: "lottery",
    thumbnail_url: "/games/mega-jackpot.jpg",
    launch_url: "/games/mega-jackpot",
    description: "Weekly lottery with massive jackpot prizes",
    is_active: true,
    is_featured: true,
    is_hot: false,
    sort_order: 12,
    min_bet: 50,
    max_bet: 5000,
    tags: ["lottery", "weekly", "jackpot", "mega", "big-prizes"],
    play_count: 0,
  },

  // Card Games
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    name: "Rummy",
    provider: "JMD Cards",
    category: "cards",
    thumbnail_url: "/games/rummy.jpg",
    launch_url: "/games/rummy",
    description: "Popular Indian card game with multiple variants",
    is_active: true,
    is_featured: false,
    is_hot: true,
    sort_order: 13,
    min_bet: 10,
    max_bet: 10000,
    tags: ["rummy", "cards", "indian", "strategy", "variants"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    name: "Poker",
    provider: "JMD Cards",
    category: "cards",
    thumbnail_url: "/games/poker.jpg",
    launch_url: "/games/poker",
    description: "Texas Hold'em and other poker variants",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 14,
    min_bet: 50,
    max_bet: 50000,
    tags: ["poker", "texas-holdem", "blinds", "tournament"],
    play_count: 0,
  },

  // Other Games
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    name: "Horse Racing",
    provider: "JMD Racing",
    category: "other",
    thumbnail_url: "/games/horse-racing.jpg",
    launch_url: "/games/horse-racing",
    description: "Bet on horse races and jockey performances",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 15,
    min_bet: 20,
    max_bet: 25000,
    tags: ["horse-racing", "jockey", "tracks", "international"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    name: "Greyhound Racing",
    provider: "JMD Racing",
    category: "other",
    thumbnail_url: "/games/greyhound.jpg",
    launch_url: "/games/greyhound",
    description: "Fast-paced greyhound racing with multiple betting options",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 16,
    min_bet: 20,
    max_bet: 25000,
    tags: ["greyhound", "dog-racing", "fast", "tracks"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440017",
    name: "Virtual Sports",
    provider: "JMD Virtual",
    category: "other",
    thumbnail_url: "/games/virtual-sports.jpg",
    launch_url: "/games/virtual-sports",
    description: "Computer-generated sports with 24/7 action",
    is_active: true,
    is_featured: false,
    is_hot: false,
    sort_order: 17,
    min_bet: 5,
    max_bet: 10000,
    tags: ["virtual", "24-7", "computer-generated", "automated"],
    play_count: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440018",
    name: "Esports Betting",
    provider: "JMD Esports",
    category: "other",
    thumbnail_url: "/games/esports.jpg",
    launch_url: "/games/esports",
    description: "Bet on competitive gaming tournaments",
    is_active: true,
    is_featured: true,
    is_hot: false,
    is_new: true,
    sort_order: 18,
    min_bet: 10,
    max_bet: 25000,
    tags: ["esports", "gaming", "tournaments", "competitive", "new"],
    play_count: 0,
  },
];

async function insertDefaultGames() {
  try {
    console.log("Inserting default games...");

    const { data, error } = await supabase
      .from("games")
      .upsert(defaultGames, { onConflict: "id", ignoreDuplicates: false });

    if (error) {
      throw error;
    }

    console.log(`Successfully inserted/updated ${data?.length || defaultGames.length} games`);

    // Group games by category for summary
    const gamesByCategory = defaultGames.reduce((acc, game) => {
      if (!acc[game.category]) {
        acc[game.category] = [];
      }
      acc[game.category].push(game);
      return acc;
    }, {});

    console.log("\nGames inserted by category:");
    Object.entries(gamesByCategory).forEach(([category, games]) => {
      console.log(`${category.toUpperCase()}: ${games.length} games`);
      games.forEach(game => {
        const flags = [];
        if (game.is_featured) flags.push("featured");
        if (game.is_hot) flags.push("hot");
        if (game.is_new) flags.push("new");
        const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : "";
        console.log(`  - ${game.name}${flagStr} - ₹${game.min_bet} to ₹${game.max_bet}`);
      });
    });

  } catch (error) {
    console.error("Error inserting games:", error);
    process.exit(1);
  }
}

insertDefaultGames();