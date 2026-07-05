let navbar = document.getElementById("navbar");
let content = document.getElementById("content");
let bikeName = document.getElementById("bikeName");
let newData = document.getElementById("newData");
let datePopup = document.getElementById("datePopup");

let currentBike;

let bikes = JSON.parse(localStorage.getItem("fuel-consumption")) || [{name: "Name", pts: []}];
let lastTab = localStorage.getItem("fuel-consumption-last-tab");
for (let b of bikes) {
  createBikeElem(b);
}
if (lastTab) {
  for (let b of bikes) if (b.name == lastTab) renderBike(b);
}
if (bikes.length != 0 && !currentBike) renderBike(bikes[0]);

function createBike() {
  let name = prompt("Name");
  if (!name) return;

  let bike = {name, pts: []};
  bikes.push(bike);
  saveData();
  createBikeElem(bike);
}
function createBikeElem(b) {
  let elem = createElement("button", {innerText: b.name, onclick: () => {
    renderBike(b);
  }});

  b.nameElem = elem;
  navbar.appendChild(elem);
}

function addData() {
  let inputs = newData.getElementsByTagName("input");

  let pt = {dist: inputs[0].value, liters: inputs[1].value, timestamp: Date.now()}

  currentBike.pts.push(pt);
  saveData();
  renderBike(currentBike);
}

function calculateConsumption(pt, lastPt) {
  return Math.max((pt.liters / (pt.dist - lastPt.dist) * 100), 0);
}



function renderBike(bike, editMode = false) {  
  currentBike = bike;

  bikeName.innerText = bike.name;
  newData.style.display = "flex";

  content.replaceChildren();


  
  let pts = [];

  let elem = createElement("tr", {}, [
    createElement("th", {innerText: "Odo (km)"}),
    createElement("th", {innerText: "Liters"}),
    createElement("th", {innerText: "L/100km"}),
    createElement("th", {innerText: "Date"}),
  ]);
  content.appendChild(elem);

  let lastPt;
  for (let pt of bike.pts) {
    let consumption = 0;
    if (lastPt) consumption = calculateConsumption(pt, lastPt);

    let elem = createElement("tr", {style: "position: relative;"}, [
      createElement("td", {innerText: pt.dist, onclick: () => {let res = prompt("Change Odo (km)", pt.dist); if (!res) return; pt.dist = res; renderBike(bike); saveData();}}),
      createElement("td", {innerText: parseFloat(pt.liters || "0")?.toFixed(2), onclick: () => {let res = prompt("Change Liters", pt.liters); if (!res) return; pt.liters = res; renderBike(bike); saveData();}}),
      createElement("td", {innerText: consumption ? consumption.toFixed(2) : "N/A"}),
      createElement("td", {innerText: pt.timestamp ? Intl.DateTimeFormat().format(pt.timestamp) : "", onclick: () => {openDatePopup(value => {pt.timestamp = new Date(value).getTime(); renderBike(bike); saveData(); }); }}),
      createElement("td", {style: "border-left: none;"}, [
        createElement("button", {className: "removeDataButton", innerText: "X", onclick: () => {
          bike.pts.splice(bike.pts.indexOf(pt), 1);
          renderBike(bike, true);
          saveData();
        }}),
      ]),
    ]);
    pts.push(elem);

    lastPt = pt;
  }

  pts.reverse();

  for (let pt of pts) content.appendChild(pt);

  if (editMode) {
    let xes = document.getElementsByClassName("removeDataButton");
    for (let x of xes) x.style.display = "block";
  }

  newData.style.width = content.offsetWidth + 'px';

  localStorage.setItem("fuel-consumption-last-tab", bike.name);
}
function renderSettings() {  
  bikeName.innerText = "Settings";

  content.replaceChildren();
  newData.style.display = "none";

  
  let pts = [];

  for (let bike of bikes) {
    let elem = createElement("tr", {}, [
      createElement("td", {innerText: bike.name, style: "text-align: start;", onclick: () => {let res = prompt("Rename " + bike.name, bike.name); if (!res) return; bike.name = res; renderSettings(bike); saveData(); bike.nameElem.innerText = res}}),
      createElement("td", {style: "border-left: none;"}, [
        createElement("button", {innerText: "X",    onclick: () => {
          if (!confirm(`Remove ${bike.name}?`)) return;

          bikes.splice(bikes.indexOf(bike), 1);
          bike.nameElem.remove();
          saveData();  

          renderSettings();
        }}),
        createElement("button", {innerText: "Edit", onclick: () => {
          renderBike(bike, true);
        }}),
        createElement("button", {innerText: "Export to Clipboard", onclick: () => {
          navigator.clipboard.writeText(JSON.stringify(bike));
          alert("Copied");
        }}),
        createElement("button", {innerText: "Export to File", onclick: () => {
          download(JSON.stringify(bike), bike.name + ".json");
        }}),
      ]),
    ]);
    pts.push(elem);
  }
  for (let pt of pts) content.appendChild(pt);

  content.appendChild(createElement("button", {innerText: "+", onclick: () => {createBike(); renderSettings()}}));

  content.appendChild(createElement("button", {innerText: "Export all to Clipboard", onclick: async () => {
    navigator.clipboard.writeText(JSON.stringify(bikes));
    alert("Copied");
  }}));

  content.appendChild(createElement("button", {innerText: "Import from Clipboard", onclick: async () => {
    let data = await navigator.clipboard.readText();

    if (!data) return;
    
    data = JSON.parse(data);

    importData(data);
  }}));
}


function importData(data) {
  if (data.name) data = [data];

  for (let d of data) {
    bikes.push(d);
    createBikeElem(d);
  }

  saveData();
  renderSettings();
}


function saveData() {
  localStorage.setItem("fuel-consumption", JSON.stringify(bikes));
}

function createElement(type, props = {}, children = []) {
  let e = document.createElement(type);
  for (let p in props) e[p] = props[p];

  for (let c of children) e.appendChild(c);
  return e;
}

let popupF;
function openDatePopup(callback) {
  datePopup.style.display = "grid";
  
  popupF = function(e) {
    callback(e.target.value);
  }

  datePopup.children[0].addEventListener("change", popupF)
}

function closeDatePopup() {  
  datePopup.style.display = "none";
  datePopup.children[0].removeEventListener("change", popupF)
}


function download(data, filename) {
    var file = new Blob([data]);
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}