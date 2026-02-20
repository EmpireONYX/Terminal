let attempts = 0;
let locked = false;

const frame = document.getElementById("frame");
const statusText = document.getElementById("statusText");
const message = document.getElementById("message");
const passInput = document.getElementById("passInput");

const LOCK_SECONDS = 10;

// If user refreshes while locked, keep them locked
(function bootLockState(){
  const lockUntil = Number(localStorage.getItem("lockUntil") || "0");
  if (lockUntil > Date.now()) {
    locked = true;
    window.location.href = "terminated.html";
  } else {
    localStorage.removeItem("lockUntil");
  }
})();

function setStatus(mode, text){
  // mode: "ok" | "denied" | "locked" | "" (neutral)
  statusText.classList.remove("ok","denied","locked");
  message.classList.remove("denied","locked");

  if (mode) statusText.classList.add(mode);
  if (mode === "denied") message.classList.add("denied");
  if (mode === "locked") message.classList.add("locked");

  statusText.innerText = text;
}

function setLockdown(on){
  if (!frame) return;
  frame.classList.toggle("lockdown", !!on);
}

function lockOut(){
  locked = true;
  setLockdown(true);
  setStatus("locked","LOCKED");
  message.innerText = "AUTH REQUEST TERMINATED";

  const lockUntil = Date.now() + LOCK_SECONDS * 1000;
  localStorage.setItem("lockUntil", String(lockUntil));

  // small delay so user sees the message flash, then go full HUD
  setTimeout(() => {
    window.location.href = "terminated.html";
  }, 450);
}
// Clock
const clockEl = document.getElementById("clock");
setInterval(() => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}, 250);

// Clear button behavior
function clearUI() {
  document.getElementById("passInput").value = "";
  document.getElementById("message").innerText = "";
  document.getElementById("statusText").innerText = "AWAITING INPUT";
  document.getElementById("frame").classList.remove("lockdown");
}
function checkPassword(){
  if (locked) return;

  const input = (passInput.value || "").trim();

  // optional: normalize case
  const code = input.toUpperCase();

  setStatus("", "AUTHENTICATING...");
  message.innerText = "";

  // small “processing” delay
  setTimeout(() => {
    if (code === "BLACKSUN") {
      setStatus("ok","AUTH OK");
      window.location.href = "clearance-alpha.html";
      return;
    }
    if (code === "REDSHADOW") {
      setStatus("ok","AUTH OK");
      window.location.href = "clearance-beta.html";
      return;
    }
    if (code === "OMEGA//EYESONLY") {
      setStatus("ok","AUTH OK");
      window.location.href = "clearance-omega.html";
      return;
    }

    attempts++;
    setStatus("denied","DENIED");
    message.innerText = `ACCESS DENIED (${attempts}/3)`;

    if (attempts >= 3) {
      lockOut();
    }
  }, 600);
}

// Optional clear button handler (if you have a CLEAR button)
function clearInput(){
  passInput.value = "";
  message.innerText = "";
  setStatus("", "AWAITING INPUT");
}

// Make functions accessible to onclick="..."
window.checkPassword = checkPassword;
window.clearInput = clearInput;

