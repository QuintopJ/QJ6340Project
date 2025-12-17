(function () {
  const container = document.getElementById("chatbot-container");
  if (!container) return;

  const windowEl = document.getElementById("chatbot-window");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const closeBtn = document.getElementById("chatbot-close");
  const messagesEl = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");

  function addMessage(text, sender = "bot") {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.innerHTML = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* =====================================================
     SITE + ARTIST KNOWLEDGE BASE
  ===================================================== */

  const SITE_KNOWLEDGE = {
    artist: "Quinn Harris",
    role: "Digital artist & NFT creator",
    style:
      "Neon cyberpunk aesthetics, street culture, vaporwave lighting, and futuristic cityscapes",
    mission:
      "This site showcases original NFT artwork that blends visual storytelling, digital illustration, and Web3 concepts.",
    tools: ["Procreate", "Photoshop", "Illustrator", "After Effects"],
    pages: {
      home: "Featured artwork and introduction to the NFT universe",
      projects: "Original NFT projects with artwork and concepts",
      about: "Artist background and creative philosophy",
      contact: "Contact form for collaborations and commissions",
    },
  };

  /* =====================================================
     PROJECT KNOWLEDGE (ART INTEGRATED)
  ===================================================== */

  const PROJECTS = [
    {
      name: "Free & Fly — Genesis",
      description:
        "A neon cyberpunk portrait centered on freedom, self-identity, and breaking away from constraints. The piece blends anime-inspired character design with urban nightlife aesthetics.",
      themes: ["Freedom", "Identity", "Urban Futurism"],
    },
    {
      name: "Live Free and Fly",
      description:
        "This artwork focuses on motion, independence, and confidence. It uses bold lighting and contrast to symbolize forward momentum and self-determination.",
      themes: ["Movement", "Confidence", "Self-Expression"],
    },
    {
      name: "Qool Cat",
      description:
        "A playful yet stylized character that represents confidence, attitude, and individuality. The neon palette and city backdrop connect humor with street culture.",
      themes: ["Individuality", "Street Culture", "Playful Rebellion"],
    },
  ];

  /* =====================================================
     NFT EDUCATION RESPONSES
  ===================================================== */

  function nftDefinition() {
    return `
<strong>What is an NFT?</strong><br>
An NFT (Non-Fungible Token) is a unique digital asset stored on the blockchain.
Unlike cryptocurrencies, NFTs are one-of-a-kind and are often used for digital art,
collectibles, and creative ownership.
`;
  }

  function mintDefinition() {
    return `
<strong>What does minting mean?</strong><br>
Minting is the process of publishing digital artwork to the blockchain.
Once minted, the artwork becomes a verifiable NFT with provable ownership.
`;
  }

  function walletDefinition() {
    return `
<strong>What is a crypto wallet?</strong><br>
A crypto wallet (like MetaMask) allows users to store NFTs and interact with Web3 platforms.
Wallets are required to mint, buy, or sell NFTs.
`;
  }

  /* =====================================================
     RESPONSE ENGINE
  ===================================================== */

  function getReply(text) {
    const q = text.toLowerCase();

    if (!q.trim()) {
      return "Ask me about NFTs, the artwork, or this site.";
    }

    if (q.includes("what is nft")) return nftDefinition();
    if (q.includes("mint")) return mintDefinition();
    if (q.includes("wallet") || q.includes("metamask"))
      return walletDefinition();

    if (q.includes("who") && q.includes("quinn")) {
      return `
<strong>About the Artist</strong><br>
${SITE_KNOWLEDGE.artist} is a digital artist focused on neon aesthetics,
urban storytelling, and blockchain-based artwork.
`;
    }

    if (q.includes("style") || q.includes("aesthetic")) {
      return `
<strong>Art Style</strong><br>
The artwork blends ${SITE_KNOWLEDGE.style}.
It emphasizes mood, lighting, and narrative over realism.
`;
    }

    if (q.includes("project")) {
      return `
<strong>Projects on this Site</strong><br>
${PROJECTS.map(
  (p) => `• <strong>${p.name}</strong>: ${p.description}`
).join("<br>")}
`;
    }

    if (q.includes("free") || q.includes("fly")) {
      return `
<strong>Free & Fly Series</strong><br>
These pieces explore themes of freedom, movement, and self-identity using cyberpunk
visual language and neon lighting.
`;
    }

    if (q.includes("cat")) {
      return `
<strong>Qool Cat</strong><br>
Qool Cat is a stylized character that blends humor with street culture,
representing confidence and individuality.
`;
    }

    if (q.includes("about")) {
      return `
<strong>About This Site</strong><br>
${SITE_KNOWLEDGE.mission}
`;
    }

    if (q.includes("contact")) {
      return `
You can contact Quinn through the Contact page for commissions or collaborations.
`;
    }

    if (q.includes("help")) {
      return `
I can help explain:
<ul>
<li>What NFTs are</li>
<li>How minting works</li>
<li>The projects and artwork</li>
<li>The artist’s creative vision</li>
</ul>
`;
    }

    return `
I’m here to help with NFTs, artwork, and this site.
Try asking about a project, an art piece, or NFTs in general.
`;
  }

  /* =====================================================
     EVENTS
  ===================================================== */

  toggleBtn.addEventListener("click", () => {
    windowEl.classList.toggle("open");
    setTimeout(() => input.focus(), 100);
  });

  closeBtn.addEventListener("click", () => {
    windowEl.classList.remove("open");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    setTimeout(() => {
      addMessage(getReply(text), "bot");
    }, 300);
  });

  /* =====================================================
     INITIAL MESSAGE
  ===================================================== */

  addMessage(
    "Hey! I’m Quinn’s AI assistant. Ask me about the artwork, NFTs, or this site."
  );
})();
