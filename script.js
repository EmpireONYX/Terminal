let attempts = 0;
let locked = false;

function setStatus(text, mode) {
  const statusEl = document.getElementById("statusText");
  const msgEl = document.getElementById("message");
  if (!statusEl || !msgEl) return;

  // reset classes
  statusEl.classList.remove("ok", "denied", "locked");
  msgEl.classList.remove("denied", "locked");

  if (mode) statusEl.classList.add(mode);
  statusEl.innerText = text;
}

function setMessage(text, mode) {
  const msgEl = document.getElementById("message");
  if (!msgEl) return;

  msgEl.classList.remove("denied", "locked");
  if (mode) msgEl.classList.add(mode);
  msgEl.innerText = text;
}

function setLockdown(on) {
  const frame = document.getElementById("frame");
  if (!frame) return; // prevents crashes on other pages
  frame.classList.toggle("lockdown", on);
}

function checkPassword() {
  // If locked, show state and refuse
  if (locked) {
    setStatus("LOCKED", "locked");
    setMessage("TERMINAL LOCKED", "locked");
    setLockdown(true);
    return;
  }

  const input = document.getElementById("passInput").value;

  if (input === "BLACKSUN") {
    setStatus("AUTH OK", "ok");
    setMessage("ACCESS GRANTED");
    window.location.href = "clearance-alpha.html";
    return;
  }

  if (input === "REDSHADOW") {
    setStatus("AUTH OK", "ok");
    setMessage("ACCESS GRANTED");
    window.location.href = "clearance-beta.html";
    return;
  }

  if (input === "OMEGA//EYESONLY") {
    setStatus("AUTH OK", "ok");
    setMessage("ACCESS GRANTED");
    window.location.href = "clearance-omega.html";
    return;
  }

  // Wrong code
  attempts++;
  setStatus("DENIED", "denied");
  setMessage("ACCESS DENIED", "denied");

  if (attempts >= 3) {
    locked = true;
    setLockdown(true);
    setStatus("LOCKED", "locked");
    setMessage("TERMINAL LOCKED", "locked");

    setTimeout(() => {
      locked = false;
      attempts = 0;
      setLockdown(false);
      setStatus("AWAITING INPUT", "");
      setMessage("", "");
    }, 10000);
  }
}
