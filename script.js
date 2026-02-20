let attempts = 0;
let locked = false;
const frame = document.getElementById("frame");

// Simple hash function
async function hash(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Pre-hashed password (hash of: BLACKSUN)
const correctHash = "e3f553..." // ← replace with real hash

if (locked) {
    document.getElementById("statusText").innerText = "LOCKED";
    return;
function checkPassword() {
  if (locked) return;

  const input = document.getElementById("passInput").value;

  if (input === "BLACKSUN") {
    window.location.href = "clearance-alpha.html";
      document.getElementById("statusText").innerText = "AUTH OK";
  } else if (input === "REDSHADOW") {
    window.location.href = "clearance-beta.html";
      document.getElementById("statusText").innerText = "AUTH OK";
  } else if (input === "OMEGA//EYESONLY") {
    window.location.href = "clearance-omega.html";
      document.getElementById("statusText").innerText = "AUTH OK";
  } else {
    attempts++;
    document.getElementById("message").innerText = "ACCESS DENIED";
      document.getElementById("statusText").innerText = "DENIED";

    if (attempts >= 3) {
      locked = true;
      frame.classList.add("lockdown");
      document.getElementById("message").innerText = "TERMINAL LOCKED";
        document.getElementById("statusText").innerText = "LOCKED";
      setTimeout(() => {
        locked = false;
        attempts = 0;
        frame.classList.remove("lockdown");
        document.getElementById("message").innerText = "";
      }, 10000);
    }
  }
}


