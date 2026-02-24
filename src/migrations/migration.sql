PRAGMA foreign_keys = ON;

CREATE TABLE machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    crafting_speed_multiplier NUMERIC(10,4) NOT NULL,
    image BLOB
);

CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES machines(id) ON DELETE CASCADE,
    craft_time_seconds NUMERIC(10,4) NOT NULL
);

CREATE TABLE items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value NUMERIC(12,4)
);

CREATE TABLE recipe_inputs (
    recipe_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    amount NUMERIC(12,4) NOT NULL,
    PRIMARY KEY (recipe_id, item_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE recipe_outputs (
    recipe_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    amount NUMERIC(12,4) NOT NULL,
    PRIMARY KEY (recipe_id, item_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE playground (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE playground_machine_card (
    id TEXT PRIMARY KEY,
    playground_id TEXT NOT NULL,
    x NUMERIC(12,4) NOT NULL,
    y NUMERIC(12,4) NOT NULL,
    color TEXT,
    machine_id TEXT NOT NULL,
    recipe_id TEXT NOT NULL,
    FOREIGN KEY (playground_id) REFERENCES playground(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE playground_connections (
    id TEXT PRIMARY KEY,
    from_card_id TEXT NOT NULL,
    to_card_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    FOREIGN KEY (from_card_id) REFERENCES playground_machine_card(id) ON DELETE CASCADE,
    FOREIGN KEY (to_card_id) REFERENCES playground_machine_card(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);