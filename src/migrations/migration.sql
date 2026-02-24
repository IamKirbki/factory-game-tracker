PRAGMA foreign_keys = ON;

-- 1. Machines (Templates like "Smelter", "Constructor")
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    crafting_speed_multiplier REAL DEFAULT 1.0, -- Use REAL for SQLite decimals
    image BLOB -- Storing path is often easier than BLOB
);

-- 2. Items (Iron Ore, Iron Ingot, etc.)
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value REAL DEFAULT 0
);

-- 3. Recipes (Belong to a machine type)
CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- Added this so you can list them in UI
    machine_id TEXT NOT NULL,
    craft_time_seconds REAL NOT NULL,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- 4. Recipe Inputs/Outputs
CREATE TABLE IF NOT EXISTS recipe_inputs (
    recipe_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    amount REAL NOT NULL,
    PRIMARY KEY (recipe_id, item_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipe_outputs (
    recipe_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    amount REAL NOT NULL,
    PRIMARY KEY (recipe_id, item_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 5. Playground (The Saved Session)
CREATE TABLE IF NOT EXISTS playground (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Machine Cards (The actual nodes on the canvas)
CREATE TABLE IF NOT EXISTS playground_machine_card (
    id TEXT PRIMARY KEY,
    playground_id TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    machine_id TEXT NOT NULL,
    recipe_id TEXT, -- REMOVED NOT NULL so you can drag-and-drop 'Idle' machines
    custom_label TEXT, -- Allow users to rename specific machines
    FOREIGN KEY (playground_id) REFERENCES playground(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);

-- 7. Connections (The Edges)
CREATE TABLE IF NOT EXISTS playground_connections (
    id TEXT PRIMARY KEY,
    playground_id TEXT NOT NULL, -- Added for easier global queries
    from_card_id TEXT NOT NULL,
    to_card_id TEXT NOT NULL,
    item_id TEXT, -- Optional: show what's flowing through the belt
    FOREIGN KEY (playground_id) REFERENCES playground(id) ON DELETE CASCADE,
    FOREIGN KEY (from_card_id) REFERENCES playground_machine_card(id) ON DELETE CASCADE,
    FOREIGN KEY (to_card_id) REFERENCES playground_machine_card(id) ON DELETE CASCADE
);