-- make sure you're on the right DB
USE nft_mint;

-- quick sanity
SELECT DATABASE() AS current_db;
SHOW TABLES;

-- see your rows
SELECT id, title, image, summary
FROM projects
ORDER BY id;

