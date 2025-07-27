let navbar = document.getElementById("navbar");
let content = document.getElementById("content");

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



function renderBike(bike) {
  content.replaceChildren();

  content.appendChild(createElement("div", {}, [
    createElement("input", {value: bike.name, onchange: e => {
      bike.name = e.target.value;
      bike.nameElem.innerText = bike.name;
      saveData();
    }}),

    createElement("button", {innerText: "X", onclick: e => {
      bikes.splice(bikes.indexOf(bike));
      bike.nameElem.remove();
      content.replaceChildren();
      saveData();
    }})
  ]));
  

  let pts = [];
  for (let pt of bike.pts) {
    let consumptionElem = createElement("div", {innerText: 0});
    function updateConsumption() {
      let idx = bike.pts.indexOf(pt);
      if (idx == 0) consumptionElem.innerText = "";
      else consumptionElem.innerText = (pt.liters / (pt.dist - bike.pts[idx - 1].dist) * 100);
    }
    updateConsumption();

    let elem = createElement("div", {}, [
      createElement("input", {value: pt.dist, onchange: e => {pt.dist = parseFloat(e.target.value); updateConsumption(); saveData()}}),
      createElement("input", {value: pt.liters, onchange: e => {pt.liters = parseFloat(e.target.value); updateConsumption(); saveData()}}),
      consumptionElem,
    ]);
    elem.style.display = "flex";
    pts.push(elem);
  }
  pts.push(createElement("button", {innerText: "+", onclick: () => {
    let d = 0;
    if (bike.pts.length >= 1) d = bike.pts[bike.pts.length - 1].dist + 1;
    bike.pts.push({dist: d, liters: 5});
    saveData();
    renderBike(bike);
  }}));

  
  content.appendChild(createElement("div", {}, pts.reverse()));
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