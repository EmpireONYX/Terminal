let attempts = 0;
let locked = false;

// Simple hash function
async function hash(text) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Pre-hashed password (hash of: BLACKSUN)
const correctHash = "e3f553..." // ← replace with real hash

async function checkPassword() {
    if (locked) return;

    const input = document.getElementById("passInput").value;
    const inputHash = await hash(input);

    if (inputHash === correctHash) {
        document.getElementById("message").innerText = "ACCESS GRANTED";
        setTimeout(() => {
            window.location.href = "clearance-alpha.html";
        }, 1000);
    } else {
        attempts++;
        document.getElementById("message").innerText = "ACCESS DENIED";

        if (attempts >= 3) {
            locked = true;
            document.getElementById("message").innerText = "TERMINAL LOCKED";
            setTimeout(() => {
                locked = false;
                attempts = 0;
                document.getElementById("message").innerText = "";
            }, 10000);
        }
    }
}
