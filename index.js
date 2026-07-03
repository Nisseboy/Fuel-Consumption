let navbar = document.getElementById("navbar");
let content = document.getElementById("content");
let bikeName = document.getElementById("bikeName");
let newData = document.getElementById("newData");
let datePopup = document.getElementById("datePopup");

let currentBike;

let bikes = JSON.parse(localStorage.getItem("fuel-consumption")) || [{name: "Name", pts: []}];
for (let b of bikes) {
  createBikeElem(b);
}
if (bikes.length != 0) renderBike(bikes[0]);

function createBike() {
  let bike = {name: "Name", pts: []};
  bikes.push(bike);
  saveData();
  createBikeElem(bike);
}
function createBikeElem(b) {
  let elem = createElement("button", {innerText: b.name, onclick: () => {
    renderBike(b);
  }});
  elem.style.marginRight = "0.2rem";

  b.nameElem = elem;
  navbar.appendChild(elem);
}

function renameBike() {
  let newName = prompt("Rename Vehicle");

  if (!newName) return;

  currentBike.name = newName;
  currentBike.nameElem.innerText = currentBike.name;
  saveData();

  renderBike(currentBike);
}
function removeBike() {
  if (!confirm(`Remove ${currentBike.name}?`)) return;

  bikes.splice(bikes.indexOf(currentBike), 1);
  currentBike.nameElem.remove();
  saveData();  

  renderBike(bikes[0]);
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



function renderBike(bike) {  
  currentBike = bike;

  bikeName.innerText = bike.name;

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

    let elem = createElement("tr", {}, [
      createElement("td", {innerText: pt.dist, onclick: () => {let res = prompt("Change Odo (km)", pt.dist); if (!res) return; pt.dist = res; renderBike(bike); saveData();}}),
      createElement("td", {innerText: pt.liters, onclick: () => {let res = prompt("Change Liters", pt.liters); if (!res) return; pt.liters = res; renderBike(bike); saveData();}}),
      createElement("td", {innerText: consumption ? consumption.toFixed(2) : "N/A"}),
      createElement("td", {innerText: pt.timestamp ? Intl.DateTimeFormat().format(pt.timestamp) : "", onclick: () => {openDatePopup(value => {pt.timestamp = new Date(value).getTime(); renderBike(bike); saveData(); }); }}),
    ]);
    pts.push(elem);

    lastPt = pt;
  }

  pts.reverse();

  for (let pt of pts) content.appendChild(pt);
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