const apiBase = "";

function displayFormattedOutput(elementId, data, label) {
    document.getElementById(elementId).textContent = `${label}\n` + JSON.stringify(data, null, 2);
}

function displayError(elementId, error, label) {
    document.getElementById(elementId).textContent = `${label}\nError: ${error}`;
}

// 3.1 Creating Short URL
async function createShortUrl() {
    const url = document.getElementById("shortenInput").value;
    const res = await fetch(`${apiBase}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (res.ok) {
        displayFormattedOutput("shortenResult", data, " Create Short URL");
    } else {
        displayError("shortenResult", data.error || data.errors?.[0]?.msg, " Create Short URL");
    }
}

// 3.2 Retrieving Original URL
async function getOriginalUrl() {
    const shortCode = document.getElementById("retrieveInput").value;
    const res = await fetch(`${apiBase}/shorten/${shortCode}`);
    const data = await res.json();
    if (res.ok) {
        displayFormattedOutput("retrieveResult", data, " Retrieve Original URL");
    } else {
        displayError("retrieveResult", data.error || data.errors?.[0]?.msg, " Retrieve Original URL");
    }
}

// 3.3 Update Short URL
async function updateUrl() {
    const shortCode = document.getElementById("updateCode").value;
    const url = document.getElementById("updateUrl").value;
    const res = await fetch(`${apiBase}/shorten/${shortCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (res.ok) {
        displayFormattedOutput("updateResult", data, " Update Short URL");
    } else {
        displayError("updateResult", data.error || data.errors?.[0]?.msg, " Update Short URL");
    }
}

// 3.4 Delete Short URL
async function deleteUrl() {
    const shortCode = document.getElementById("deleteInput").value;
    const res = await fetch(`${apiBase}/shorten/${shortCode}`, { method: "DELETE" });
    const output = res.status === 204 ? "Deleted successfully" : "Error deleting URL";
    document.getElementById("deleteResult").textContent = ` Delete Short URL\n${output}`;
}

// 3.5 Get URL Statistics
async function getStatistics() {
    const shortCode = document.getElementById("statsInput").value;
    const res = await fetch(`${apiBase}/statistics/${shortCode}`);
    const data = await res.json();
    if (res.ok) {
        displayFormattedOutput("statsResult", data, " Get URL Statistics");
    } else {
        displayError("statsResult", data.error || "Error fetching stats", " Get URL Statistics");
    }
}
