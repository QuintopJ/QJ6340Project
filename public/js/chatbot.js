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
      return "An NFT (non-fungible token) is a unique digital asset stored on the blockchain. In this project, NFTs are tied to a collection and can be displayed or minted depending on how the site is configured.";
    }

    if (text.includes("mint")) {
      return "Minting is the process of creating a new NFT on the blockchain. On this site, minting happens through the wallet connection (ex: MetaMask) and a transaction approval.";
    }

    if (text.includes("wallet") || text.includes("metamask")) {
      return "You can connect a Web3 wallet like MetaMask using the Connect Wallet button. Make sure you're on the right network and have some ETH if needed.";
    }

    if (text.includes("project") || text.includes("collection")) {
      return "You can explore collections on the Projects page. Each project card shows info and links related to that collection.";
    }

    return "I can help with NFTs, collections, wallet connections, and live OpenSea collection info if you paste an OpenSea collection link.";
  }

  // -------- OpenSea live collection lookup --------
  async function tryOpenSeaCollection(text) {
    const match = text.match(/opensea\.io\/collection\/([a-zA-Z0-9\-]+)/i);
    if (!match) return null;

    const slug = match[1];

    try {
      const r = await fetch(`/api/nft/opensea?slug=${encodeURIComponent(slug)}`);
      const data = await r.json();

      if (data?.error) return "I couldn’t fetch that collection right now.";
      if (data?.message) return data.message;

      const floor = data.floorEth ? `${data.floorEth} ETH` : "N/A";

      return (
        `OpenSea Live Info:\n` +
        `• ${data.name}\n` +
        `• Floor: ${floor}\n` +
        `• Supply: ${data.supply ?? "N/A"}\n` +
        `• Owners: ${data.owners ?? "N/A"}`
      );
    } catch (_err) {
      return "There was an issue reaching OpenSea.";
    }
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

  // ✅ Corrected: async submit handler + OpenSea first
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    input.value = "";

    // 🔍 Try OpenSea first (paste a link like https://opensea.io/collection/azuki)
    const live = await tryOpenSeaCollection(text);
    if (live) {
      appendMessage(live, "bot");
      return;
    }

    // Fallback to local keyword-based replies
    const reply = getBotReply(text);
    setTimeout(() => appendMessage(reply, "bot"), 250);
  });
})();
