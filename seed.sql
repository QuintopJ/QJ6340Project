USE defaultdb;

DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_name         VARCHAR(150)   NOT NULL,
  img_url              VARCHAR(500)   NOT NULL,
  project_description  VARCHAR(2500)  NOT NULL,
  quantity             INT            NOT NULL,
  price_eth            DECIMAL(10,2)  NOT NULL,
  open_date_gmt        DATETIME       NOT NULL,
  royalty_percent      DECIMAL(5,2)   NOT NULL,
  active               TINYINT(1)     NOT NULL DEFAULT 0,
  marketplace_url      VARCHAR(500)   NULL,
  PRIMARY KEY (id)
);

INSERT INTO projects (
  project_name, img_url, project_description, quantity, price_eth,
  open_date_gmt, royalty_percent, active, marketplace_url
) VALUES
(
  'Project 1',
  'https://quinn-nft-mint-cdn.sfo3.cdn.digitaloceanspaces.com/Images/featured.jpg',
  'This is a short description of the first project.',
  25, 1.0, '2024-02-01 09:00:00', 7.00, 1, 'https://opensea.io'
),
(
  'Project 2',
  'https://quinn-nft-mint-cdn.sfo3.cdn.digitaloceanspaces.com/Images/q_splash.png',
  'This is a short description of the second project.',
  64, 1.5, '2023-12-15 07:30:00', 5.00, 1, 'https://opensea.io'
),
(
  'Project 3',
  'https://quinn-nft-mint-cdn.sfo3.cdn.digitaloceanspaces.com/Images/qool_cat.png',
  'This is a short description of the third project.',
  512, 2.0, '2024-03-19 05:00:00', 2.00, 1, 'https://opensea.io'
);

-- sanity check
SELECT id, project_name, LEFT(img_url,60) AS img, active FROM projects;
