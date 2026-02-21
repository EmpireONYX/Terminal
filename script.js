let attempts = 0;
let locked = false;

const frame = document.getElementById("frame");
const statusText = document.getElementById("statusText");
const message = document.getElementById("message");
const passInput = document.getElementById("passInput");

const LOCK_SECONDS = 10;

const WORKER_URL = "https://arbiter-log.damshadow1123.workers.dev";

const ADMIN_CLEAR_CODE = "ARBITER-CLEAR"; // change to whatever you want

async function logEvent(event, reason, meta = {}) {
  try {
    await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        reason,
        page: location.pathname,
        meta: {
          attempts,
          ua: navigator.userAgent,
          ...meta,
        },
      }),
    });
  } catch (e) {
    // logging failure should never block UX
  }
}

// If user refreshes while locked/terminated, keep them in terminated page
(function bootLockState(){
  const lockUntil = Number(localStorage.getItem("lockUntil") || "0");
  const termMode = localStorage.getItem("termMode") || "";

  // If it's a HARD termination (no retry), always stay terminated until cleared manually
  if (termMode === "HARD") {
    window.location.href = "terminated.html";
    return;
  }

  // Normal lockout timer
  if (lockUntil > Date.now()) {
    locked = true;
    window.location.href = "terminated.html";
  } else {
    localStorage.removeItem("lockUntil");
    localStorage.removeItem("termMode");
    localStorage.removeItem("termTitle");
    localStorage.removeItem("termWarn");
    localStorage.removeItem("termReason");
  }
})();

function setStatus(mode, text){
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

/** Normal lockout: countdown + auto-return */
function lockOut(){
  locked = true;
  logEvent("LOCKOUT", "3_WRONG_CODES", { attempts });
  setLockdown(true);
  setStatus("locked","LOCKED");
  message.innerText = "TERMINAL LOCKED";

  localStorage.setItem("termMode", "LOCK");                 // show countdown
  localStorage.setItem("termTitle", "AUTH REQUEST TERMINATED");
  localStorage.setItem("termWarn", "UNAUTHORIZED ACCESS WILL BE LOGGED");

  const lockUntil = Date.now() + LOCK_SECONDS * 1000;
  localStorage.setItem("lockUntil", String(lockUntil));

  setTimeout(() => {
    window.location.href = "terminated.html";
  }, 450);
}

/** Hard termination: no countdown, stays until you clear it */
function terminate(reasonCode = "OMEGA_EXPOSURE"){
  locked = true;
  logEvent("TERMINATE", reasonCode, { attempts });
  setLockdown(true);
  setStatus("locked","TERMINATED");
  message.innerText = "EXPOSURE EVENT CONFIRMED";

  localStorage.setItem("termMode", "HARD");                 // hide countdown
  localStorage.removeItem("lockUntil");                     // no timer
  localStorage.setItem("termTitle", "EXPOSURE EVENT CONFIRMED");
  localStorage.setItem(
    "termWarn",
    "REMAIN CALM. DO NOT DISCONNECT. ARBITER RESPONSE UNIT EN ROUTE."
  );
  localStorage.setItem("termReason", reasonCode);

  setTimeout(() => {
    window.location.href = "terminated.html";
  }, 450);
}

function adminClear(){
  // clears HARD termination + normal lockout
  localStorage.removeItem("termMode");
  localStorage.removeItem("termTitle");
  localStorage.removeItem("termWarn");
  localStorage.removeItem("termReason");
  localStorage.removeItem("lockUntil");
  attempts = 0;
  locked = false;
  setLockdown(false);
  setStatus("", "AWAITING INPUT");
  message.innerText = "";

  logEvent("ADMIN_CLEAR", "MANUAL_OVERRIDE", {});
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

function checkPassword() {
  // allow admin clear even if locked
  const codeTry = (passInput.value || "").trim().toUpperCase();
  if (codeTry === ADMIN_CLEAR_CODE) {
    adminClear();
    clearInput();
    return;
  }

  if (locked) return;

  const code = codeTry;

  setStatus("", "AUTHENTICATING...");
  message.innerText = "";

  setTimeout(() => {
    if (code === "BLACKSUN") {
      setStatus("ok", "AUTH OK");
      window.location.href = "clearance-alpha.html";
      return;
    }
    if (code === "REDSHADOW") {
      setStatus("ok", "AUTH OK");
      window.location.href = "clearance-beta.html";
      return;
    }
    if (code === "OMEGA//EYESONLY") {
      setStatus("ok", "AUTH OK");
      window.location.href = "clearance-omega.html";
      return;
    }

    // tripwire -> HARD terminate
    if (code.includes("ARBITER") || code.includes("OMEGA")) {
      terminate("CONFIDENTIAL_KEYWORD_TRIP");
      return;
    }

    attempts++;
    setStatus("denied", "DENIED");
    message.innerText = `ACCESS DENIED (${attempts}/3)`;

    logEvent("DENY", "BAD_CODE", { attempt: attempts });

    if (attempts >= 3) lockOut();
  }, 600);
}

function clearInput(){
  passInput.value = "";
  message.innerText = "";
  setStatus("", "AWAITING INPUT");
}

window.checkPassword = checkPassword;
window.clearInput = clearInput;

