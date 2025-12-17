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

  // ---------- SITE KNOWLEDGE ----------
  const SITE_KNOWLEDGE = {
    owner: "Quinn Harris",
    theme: "Digital art, neon aesthetics, street culture, and blockchain",
    purpose:
      "This site showcases original NFT projects created by Quinn, blending digital art and Web3 concepts.",
    navigation: {
      home: "Featured NFT artwork and site introduction",
      projects: "All NFT collections and individual artworks",
      about: "Artist background and creative focus",
      contact: "Direct contact form for inquiries and commissions",
    },
  };

  // ---------- NFT KNOWLEDGE ----------
  function nftExplanation() {
    return `
<strong>What is an NFT?</strong><br>
An NFT (Non-Fungible Token) is a unique digital asset stored on the blockchain. 
Unlike cryptocurrencies, NFTs are one-of-a-kind and often represent art, music, or collectibles.
`;
  }

  function mintExplanation() {
    return `
<strong>What is minting?</strong><br>
Minting is the process of publishing a digital artwork to the blockchain so it becomes an NFT.
Once minted, ownership can be verified publicly and transferred securely.
`;
  }

  // ---------- PROJECT AWARENESS ----------
  function projectExplanation() {
    return `
<strong>Projects on this site</strong><br>
Each project represents an original NFT artwork or collection.
You can explore visuals, concepts, and future minting plans on the Projects page.
Each artwork is paired with custom imagery and a unique creative concept.
`;
  }

  // ---------- AI-STYLE RESPONSE ROUTER ----------
  function getReply(text) {
    const q = text.toLowerCase();

    if (!q.trim()) {
      return "Ask me about NFTs, the projects, or how this site works.";
    }

    if (q.includes("what is nft") || q.includes("what are nfts")) {
      return nftExplanation();
    }

    if (q.includes("mint")) {
      return mintExplanation();
    }

    if (q.includes("wallet") || q.includes("metamask")) {
      return `
<strong>Wallets</strong><br>
A crypto wallet like MetaMask lets you connect to NFT platforms and manage digital assets.
When minting is enabled, wallets are required to complete blockchain transactions.
`;
    }

    if (q.includes("project") || q.includes("art") || q.includes("collection")) {
      return projectExplanation();
    }

    if (q.includes("who") && q.includes("quinn")) {
      return `
<strong>About the artist</strong><br>
${SITE_KNOWLEDGE.owner} is a digital artist focused on neon aesthetics, motion, and blockchain-based art.
`;
    }

    if (q.includes("about")) {
      return `
<strong>About this site</strong><br>
${SITE_KNOWLEDGE.purpose}
`;
    }

    if (q.includes("contact")) {
      return `
You can reach Quinn through the Contact page using the form provided there.
`;
    }

    if (q.includes("help")) {
      return `
I can help explain:
<ul>
  <li>What NFTs are</li>
  <li>What minting means</li>
  <li>How wallets work</li>
  <li>The projects and artwork on this site</li>
</ul>
`;
    }

    return `
I’m here to help with NFTs, artwork, and navigating this site.
Try asking about a project, minting, or NFTs in general.
`;
  }

  // ---------- EVENTS ----------
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

  // Initial greeting
  addMessage(
    "Hey! I’m Quinn’s AI assistant. Ask me about NFTs, the artwork, or how this site works."
  );
})();
