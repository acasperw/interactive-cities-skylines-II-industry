// ============================================================================
// Cities: Skylines II — Industry flow data
// ----------------------------------------------------------------------------
// THIS FILE IS THE SINGLE SOURCE OF TRUTH.
// To fix or extend the chart, just edit the `ITEMS` array below.
//
// Each item lists what it is made from via `inputs` (an array of other item
// ids). Edges/arrows are derived automatically: every input -> item.
//
// `category` controls the node color and roughly maps to the rows in the game
// chart:
//   raw        = extracted raw resources (top row)
//   material   = intermediate processed materials
//   good       = finished goods
//   commercial = leisure / commercial services that consume goods
//   office     = office / software / telecom services
//
// NOTE: This initial dataset was transcribed from a single reference image and
// is known to be incomplete/partly wrong (e.g. telecom can need software OR
// software + electronics). Treat it as a starting point to correct together.
// ============================================================================

export type Category =
  | "raw"
  | "material"
  | "good"
  | "commercial"
  | "office";

/**
 * Where an item can go *besides* being an input to another item in the chart.
 * These are terminal destinations we don't model as nodes (to keep the graph
 * readable) but want to tag for later use (filters, details panel, etc.).
 */
export type Sink =
  | "consumers"
  | "industry"
  | "offices"
  | "export"
  | "heating"
  | "electricity"
  | "parks"
  | "fireRescue";

export interface Item {
  /** Stable unique id (used for edges). Use kebab-case. */
  id: string;
  /** Human-readable label shown on the node. */
  label: string;
  category: Category;
  /** Ids of items this one is produced from. Raw items have none. */
  inputs?: string[];
  /**
   * Non-node destinations this item can also be sold/sent to. An item with no
   * outgoing edges to other items is an "end of chain" — that is derived from
   * the graph, not stored here.
   */
  sinks?: Sink[];
  /**
   * True if this is an immaterial good (not physically transported by truck,
   * e.g. services). Affects how it is exported/distributed.
   */
  immaterial?: boolean;
  /** Optional free-text note (uncertainty, alternate recipes, etc.). */
  note?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  raw: "Raw resource",
  material: "Material",
  good: "Finished good",
  commercial: "Commercial / leisure",
  office: "Office / software",
};

/** Shared accent colors per category, used for the legend and edge coloring. */
export const CATEGORY_COLORS: Record<Category, string> = {
  raw: "#7cae5b",
  material: "#c99a45",
  good: "#4f9fd6",
  commercial: "#9a7fe0",
  office: "#d97bad",
};

export const SINK_LABELS: Record<Sink, string> = {
  consumers: "Sold to consumers",
  industry: "Used by industry",
  offices: "Used by offices",
  export: "Exported as surplus",
  heating: "Used for heating",
  electricity: "Used for electricity generation",
  parks: "Used in Parks & Recreation",
  fireRescue: "Used by Fire & Rescue",
};

export const ITEMS: Item[] = [
  // --- Raw resources ---------------------------------------------------------
  { id: "wood", label: "Wood", category: "raw" },
  { id: "grain", label: "Grain", category: "raw" },
  { id: "livestock", label: "Livestock", category: "raw", sinks: ["export"] },
  { id: "fish", label: "Fish", category: "raw" },
  { id: "vegetables", label: "Vegetables", category: "raw" },
  { id: "cotton", label: "Cotton", category: "raw" },
  { id: "oil", label: "Crude Oil", category: "raw", sinks: ["export"] },
  { id: "coal", label: "Coal", category: "raw" },
  { id: "stone", label: "Stone", category: "raw" },
  { id: "ore", label: "Ore", category: "raw" },

  // --- Materials -------------------------------------------------------------
  { id: "timber", label: "Timber", category: "material", inputs: ["wood"] },
  { id: "paper", label: "Paper", category: "material", inputs: ["wood"] },
  {
    id: "petrochemicals",
    label: "Petrochemicals",
    category: "material",
    inputs: ["grain", "oil"],
    sinks: ["consumers", "export", "heating", "electricity"],
  },
  {
    id: "metals",
    label: "Metals",
    category: "material",
    inputs: ["ore", "coal"],
  },
  { id: "minerals", label: "Minerals", category: "material", inputs: ["stone"] },
  {
    id: "chemicals",
    label: "Chemicals",
    category: "material",
    inputs: ["minerals", "oil"],
    sinks: ["consumers", "export"],
  },

  // --- Finished goods --------------------------------------------------------
  { id: "furniture", label: "Furniture", category: "good", inputs: ["timber"] },
  {
    id: "convenience-food",
    label: "Convenience Food",
    category: "good",
    inputs: ["livestock", "grain", "fish"],
    sinks: ["consumers", "export"],
  },
  {
    id: "food",
    label: "Food",
    category: "good",
    inputs: ["livestock", "vegetables", "fish"],
    sinks: ["consumers", "export", "fireRescue"],
  },
  {
    id: "beverages",
    label: "Beverages",
    category: "good",
    inputs: ["grain", "vegetables"],
    sinks: ["consumers", "export", "parks"],
  },
  {
    id: "textiles",
    label: "Textiles",
    category: "good",
    inputs: ["cotton", "livestock", "petrochemicals"],
    sinks: ["consumers", "export"],
  },
  {
    id: "plastics",
    label: "Plastics",
    category: "good",
    inputs: ["petrochemicals", "chemicals"],
  },
  {
    id: "pharmaceuticals",
    label: "Pharmaceuticals",
    category: "good",
    inputs: ["chemicals"],
  },
  {
    id: "concrete",
    label: "Concrete",
    category: "good",
    inputs: ["stone"],
    note: "Required for upkeep.",
  },
  {
    id: "machinery",
    label: "Machinery",
    category: "good",
    inputs: ["metals"],
  },
  {
    id: "electronics",
    label: "Electronics",
    category: "good",
    inputs: ["minerals", "plastics"],
    sinks: ["consumers", "export"],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    category: "good",
    inputs: ["metals", "plastics"],
  },
  {
    id: "software",
    label: "Software",
    category: "office",
    inputs: ["electronics"],
    sinks: ["consumers", "industry", "offices", "export"],
    immaterial: true,
  },

  // --- Office services ------------------------------------------------------
  {
    id: "financial",
    label: "Financial",
    category: "office",
    inputs: ["software"],
    sinks: ["consumers", "industry", "offices", "export"],
    immaterial: true,
  },
  {
    id: "telecom",
    label: "Telecom",
    category: "office",
    inputs: ["software", "electronics"],
    sinks: ["consumers", "industry", "offices", "export"],
    immaterial: true,
  },
  {
    id: "media",
    label: "Media",
    category: "office",
    inputs: ["software"],
    sinks: ["consumers", "export"],
    immaterial: true,
  },

  // --- Commercial / leisure -------------------------------------------------
  {
    id: "entertainment",
    label: "Entertainment",
    category: "commercial",
    inputs: ["beverages"],
    sinks: ["consumers", "export"],
    immaterial: true,
  },
  {
    id: "lodging",
    label: "Lodging",
    category: "commercial",
    inputs: ["food"],
  },
  {
    id: "meals",
    label: "Meals",
    category: "commercial",
    inputs: ["food"],
  },
];
