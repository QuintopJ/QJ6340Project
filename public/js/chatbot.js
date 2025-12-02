// public/js/chatbot.js
(function () {
  const container = document.getElementById("chatbot-container");
  if (!container) return;

  const windowEl = document.getElementById("chatbot-window");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const closeBtn = document.getElementById("chatbot-close");
  const messagesEl = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");

  if (!windowEl || !toggleBtn || !messagesEl || !form || !input) return;

  function appendMessage(text, sender = "bot") {
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function getBotReply(rawText) {
    const text = rawText.toLowerCase().trim();

    if (!text) return "Try asking me something about NFTs, wallets, or this site.";

    // Very simple "AI-ish" keyword routing for now
    if (text.includes("nft") || text.includes("token")) {
      return "An NFT (non-fungible token) is a unique digital asset stored on the blockchain. On this site, my projects are NFTs you can view, learn about, and mint.";
    }

    if (text.includes("mint")) {
      return "Minting is the process of creating a new NFT on the blockchain. Once you connect your wallet, you’ll be able to mint directly from the project page when that feature is enabled.";
    }

    if (text.includes("wallet") || text.includes("metamask")) {
      return "You can connect a Web3 wallet like MetaMask using the Connect Wallet button in the navbar. Make sure you're on the right network and have some test ETH if you're on a testnet.";
    }

    if (text.includes("project") || text.includes("collection")) {
      return "You can explore all current collections on the Projects page. Click into any project card to see details, images, and minting info.";
    }

    if (text.includes("quinn") || text.includes("you")) {
      return "I’m Quinn’s on-site AI assistant. I’m here to explain the basics of the project, NFTs, and how to navigate the site.";
    }

    if (text.includes("contact") || text.includes("email") || text.includes("reach")) {
      return "You can reach out through the Contact page using the form there. I’m just the chat assistant, but Quinn reads real messages from that form.";
    }

    if (text.includes("help")) {
      return "I can help with: what NFTs are, how wallets work, what minting means, and where to find things on this site. Try asking: “What is minting?” or “Where are the projects?”";
    }

    // Generic fallback
    return "I may not have a perfect AI answer for that yet, but I can help with NFTs, minting, wallets, and navigating this site. Try asking about one of those, or say “help.”";
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = windowEl.classList.contains("open");
    if (!isOpen) {
      windowEl.classList.add("open");
      setTimeout(() => input.focus(), 50);
    } else {
      windowEl.classList.remove("open");
    }
  });

  closeBtn?.addEventListener("click", () => {
    windowEl.classList.remove("open");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    input.value = "";

    const reply = getBotReply(text);
    setTimeout(() => appendMessage(reply, "bot"), 250);
  });
})();
