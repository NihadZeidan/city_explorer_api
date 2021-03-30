DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    -- id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    display_name VARCHAR(255),
    lat NUMERIC(10, 7),
    lon NUMERIC(10, 7)
  );

