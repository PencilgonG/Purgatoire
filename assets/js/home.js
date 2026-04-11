
async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return text.split("\n").slice(1).map(r => r.split(","));
}

// CONFIG
const cfg = window.PURGATOIRE_CONFIG;

// LOAD DATA
async function initHome() {

  const membres = await loadCSV(cfg.sheets.rosterCsvUrl);
  const gdg = await loadCSV(cfg.sheets.gdgCsvUrl);
  const annonces = await loadCSV(cfg.sheets.annoncesCsvUrl);

  // MEMBERS COUNT
  const membersCount = membres.length;

  // CC MOYENNE
  const ccIndex = 2;
  const ccValues = membres.map(m => parseInt(m[ccIndex]) || 0);
  const avgCC = Math.round(ccValues.reduce((a,b)=>a+b,0) / ccValues.length);

  // ANNONCES COUNT
  const annoncesCount = annonces.length;

  // DERNIER GDG
  const lastGDG = gdg[0] ? gdg[0][2] : "—";

  // UPDATE DOM
  document.querySelectorAll(".stats span")[0].innerText = membersCount;
  document.querySelectorAll(".stats span")[1].innerText = (avgCC/1000000).toFixed(2)+"M";
  document.querySelectorAll(".stats span")[2].innerText = annoncesCount;
  document.querySelectorAll(".stats span")[3].innerText = lastGDG;

  // TOP 5
  const sorted = membres.sort((a,b) => (b[2]||0)-(a[2]||0)).slice(0,5);

  const topList = document.querySelector(".top");
  topList.innerHTML = "";

  sorted.forEach(m => {
    const li = document.createElement("li");
    li.innerText = m[1] + " - " + (m[2]/1000000).toFixed(2)+"M";
    topList.appendChild(li);
  });

  // ANNONCES RECENTES
  const container = document.querySelector(".bloc");
  annonces.slice(0,2).forEach(a => {
    const div = document.createElement("div");
    div.className = "mini-annonce";
    div.innerText = a[1];
    container.appendChild(div);
  });

}

initHome();

