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

    if (text.includes("nft") || text.includes("token")) {
      return "An NFT is a unique digital asset stored on the blockchain. This site is set up to explore NFT collections and projects with a clean portfolio vibe.";
    }

    if (text.includes("mint")) {
      return "Minting is creating a new NFT on-chain. If minting is enabled, you’d connect your wallet and approve a transaction.";
    }

    if (text.includes("wallet") || text.includes("metamask")) {
      return "Use the Connect Wallet button to link MetaMask. Make sure you're on the right network and have ETH if needed.";
    }

    return "If you paste an OpenSea collection link (like /collection/azuki), I can try pulling live collection info.";
  }

  async function tryOpenSeaCollection(text) {
    const match = text.match(/opensea\.io\/collection\/([a-zA-Z0-9\-]+)/i);
    if (!match) return null;

    const slug = match[1];

    try {
      const r = await fetch(`/api/nft/opensea?slug=${encodeURIComponent(slug)}`);
      const data = await r.json();

      // ✅ Show the real reason if OpenSea blocks the request
      if (data?.status) {
        return `OpenSea blocked the request (status ${data.status}). Try again later, or we may need an API key.\n${data.bodyPreview ? "Details: " + data.bodyPreview : ""}`;
      }

      if (data?.error) return `Couldn’t fetch that collection: ${data.error}`;
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
      return "There was an issue reaching the server endpoint.";
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

  closeBtn?.addEventListener("click", () => windowEl.classList.remove("open"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    input.value = "";

    const live = await tryOpenSeaCollection(text);
    if (live) {
      appendMessage(live, "bot");
      return;
    }

    const reply = getBotReply(text);
    setTimeout(() => appendMessage(reply, "bot"), 250);
  });
})();
