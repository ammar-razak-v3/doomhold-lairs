// Doomhold Lair Rentals - Resource Planner
var RATES = { rations: 3, water: 4, tonic: 2, tonicNight: 3, lozenges: 1 };
var LAIRS = {
  volcano: { name: "Volcano Fortress", cells: 5 },
  arctic: { name: "Arctic Bunker", cells: 8 },
  orbital: { name: "Orbital Station", cells: 12 }
};

// ---------- Validation ----------
function validateForm() {
  var errors = [];
  var name = document.getElementById("custName").value.trim();
  var email = document.getElementById("custEmail").value.trim();
  var lair = document.getElementById("lairType").value;
  var henchRaw = document.getElementById("henchmen").value.trim();
  var daysRaw = document.getElementById("days").value.trim();
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2) errors.push("Villain name is required (at least 2 characters).");
  if (email === "") errors.push("Email is required.");
  else if (!emailPattern.test(email)) errors.push("Email format is invalid (example: you@evil.com).");
  if (lair === "") errors.push("Please select a lair type.");

  var hench = Number(henchRaw);
  if (henchRaw === "" || isNaN(hench) || !Number.isInteger(hench) || hench < 1 || hench > 100)
    errors.push("Number of henchmen must be a whole number from 1 to 100.");
  var days = Number(daysRaw);
  if (daysRaw === "" || isNaN(days) || !Number.isInteger(days) || days < 1 || days > 30)
    errors.push("Rental days must be a whole number from 1 to 30.");

  return errors;
}

// ---------- Calculation ----------
function calculateSupplies(hench, days, lairKey, bufferPct, night, suits) {
  var factor = 1 + bufferPct / 100;
  var tonicRate = night ? RATES.tonicNight : RATES.tonic;
  var items = [
    { label: "Ration packs", base: RATES.rations * hench * days, buffered: true },
    { label: "Water bottles (1 L)", base: RATES.water * hench * days, buffered: true },
    { label: "Energy tonic cans", base: tonicRate * hench * days, buffered: true },
    { label: "Throat lozenges", base: RATES.lozenges * hench * days, buffered: true },
    { label: "Lair power cells", base: LAIRS[lairKey].cells * days, buffered: false }
  ];
  if (suits) items.push({ label: "Hazard suits", base: hench, buffered: false });

  var total = 0;
  items.forEach(function (it) {
    it.final = it.buffered ? Math.ceil(it.base * factor - 1e-9) : it.base;
    total += it.final;
  });
  return { items: items, total: total };
}

// ---------- Result display ----------
function showResult(data) {
  var box = document.getElementById("result");
  box.innerHTML = "";
  var panel = document.createElement("div");
  panel.className = "panel";

  var h = document.createElement("h2");
  h.textContent = "Supply manifest";
  var who = document.createElement("p");
  who.textContent = "Prepared for " + data.name + " (" + data.email + ")";
  var sum = document.createElement("p");
  sum.textContent = LAIRS[data.lair].name + " | " + data.hench + " henchmen | " + data.days +
    " days | Buffer: " + data.buffer + "% | Night-shift: " + (data.night ? "Yes" : "No") +
    " | Hazard suits: " + (data.suits ? "Yes" : "No");

  var wrap = document.createElement("div");
  wrap.className = "scroll";
  var rows = data.result.items.map(function (it) {
    return "<tr><td>" + it.label + "</td><td>" + it.base + "</td><td>" + it.final + "</td></tr>";
  }).join("");
  wrap.innerHTML = '<table class="report"><thead><tr><th>Supply</th><th>Base need</th><th>Stock to order</th></tr></thead><tbody>' +
    rows + '<tr class="total"><td>Total units</td><td></td><td>' + data.result.total + "</td></tr></tbody></table>";

  panel.appendChild(h); panel.appendChild(who); panel.appendChild(sum); panel.appendChild(wrap);
  box.appendChild(panel);
  box.className = "show";
  box.focus();
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Events ----------
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("plannerForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = validateForm();
    if (errors.length > 0) {
      document.getElementById("result").className = "";
      alert("Invalid input, please check your form:\n\n- " + errors.join("\n- "));
      return;
    }
    var hench = Number(document.getElementById("henchmen").value);
    var days = Number(document.getElementById("days").value);
    var lair = document.getElementById("lairType").value;
    var buffer = Number(document.querySelector('input[name="buffer"]:checked').value);
    var night = document.getElementById("nightShift").checked;
    var suits = document.getElementById("hazardSuits").checked;

    var result = calculateSupplies(hench, days, lair, buffer, night, suits);
    showResult({
      name: document.getElementById("custName").value.trim(),
      email: document.getElementById("custEmail").value.trim(),
      hench: hench, days: days, lair: lair, buffer: buffer, night: night, suits: suits, result: result
    });
    alert("Calculation complete! Your supply manifest is ready.");
  });

  form.addEventListener("reset", function () {
    document.getElementById("result").className = "";
  });
});
