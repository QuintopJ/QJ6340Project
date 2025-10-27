// === MetaMask Wallet Connection ===
document.getElementById("wallet-connect")?.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected. Please install it from metamask.io 🦊");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const walletButton = document.getElementById("wallet-connect");
    const shortAddress = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
    walletButton.textContent = `🟢 ${shortAddress}`;
    walletButton.classList.remove("btn-outline-info");
    walletButton.classList.add("btn-success");
  } catch (err) {
    console.error("MetaMask connection error:", err);
    alert("Wallet connection failed. Try again.");
  }
});
