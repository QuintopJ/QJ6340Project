USE nft_mint;

-- Drop & recreate table (safe reset)
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  summary TEXT,
  description TEXT,
  tags JSON,
  marketplaceUrl VARCHAR(512)
);

-- Insert 3 clean rows
INSERT INTO projects (title, image, summary, description, tags, marketplaceUrl) VALUES
('Qool Cat — Night Run',
 '/images/qool_cat.png',
 'Neon-soaked portrait series with LA vaporwave vibes.',
 'A portrait-driven set exploring neon bloom, film grain, and LA’s midnight color palette.',
 JSON_ARRAY('1/1','Ethereum','Portrait'),
 'https://opensea.io/'),

('Free & FLY — Genesis',
 '/images/featured.jpg',
 'Motion-infused city palms and synth skies.',
 'First collection drop with retro-futurist tones and graded neon atmospherics.',
 JSON_ARRAY('Collection','Tezos','Vaporwave'),
 'https://opensea.io/'),

('Process Study — Skyline Neon',
 '/images/q_splash.png',
 'Color grading, grain, and neon bloom experiments.',
 'Iterations on glow pipelines and motion textures to define the visual language.',
 JSON_ARRAY('Experiment','Animation'),
 NULL);

-- Check
SELECT COUNT(*) AS total_rows FROM projects;
SELECT id, title, image FROM projects;

