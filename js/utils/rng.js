function getSeed() {
	if (window.player !== undefined) return player.seed;
	else if (localStorage.getItem("rng_madness") !== null ? JSON.parse(atob(localStorage.getItem("rng_madness"))) !== null : false) return JSON.parse(atob(localStorage.getItem("rng_madness"))).seed;
	else return Math.round(Math.random()*1e63);
}

function RNGReset() {
	let s = +prompt("Enter a seed (number from 1 to 999999999).");
	if (isNaN(s)) return;
	if (s<0 || s>=1e63 || s!=Math.round(s)) return;
	hardReset(false, s);
}

const RNG_DATA = {
	rows: 7,
	minLayers: 1,
	maxLayers: 6,
	layers(row) { 
		let l = Math.max(Math.min(Math.floor(random(getSeed()*row)*RNG_DATA.maxLayers+1), RNG_DATA.maxLayers), RNG_DATA.minLayers);
		return Math.min(l, row);		
	},
	chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()'.split(''),
	types: ["normal", "static"],
	rowReqs: {
		1: new Decimal(10),
		2: new Decimal(1e3),
		3: new Decimal(1e10),
		4: new Decimal(1e25),
		5: new Decimal(1e70),
		6: new Decimal("1e100"),
		7: new Decimal("1e150"),
	},
	rowBaseExps: {
		1: new Decimal(0.5),
		2: new Decimal(0.25),
		3: new Decimal(0.01),
		4: new Decimal(0.0025),
		5: new Decimal(0.001),
		6: new Decimal(0.0005),
		7: new Decimal(0.00025),
	},
	staticRowBaseExps: {
		1: new Decimal(1),
		2: new Decimal(1.2),
		3: new Decimal(1.5),
		4: new Decimal(2),
		5: new Decimal(2.5),
		6: new Decimal(3),
		7: new Decimal(3.5),
	},
	rowLayerTotalMultExps: {
		1: new Decimal(0.5),
		2: new Decimal(0.75),
		3: new Decimal(0.875),
		4: new Decimal(0.95),
		5: new Decimal(0.98),
		6: new Decimal(0.99),
		7: new Decimal(0.995),
	},
}

function random(seed) {
    var x = Math.sin(seed*10+1) * 10000;
    return x - Math.floor(x);
}

function globalEffect(target) {
	let eff = new Decimal(1);
	for (let l in layers) {
		if (!tmp[l].hasEffect) continue;
		if (tmp[l].effectTarget == target) {
			if (target!="NONE"?tmp[target].type=="static":false) eff = eff.div(tmp[l].effect);
			else eff = eff.times(tmp[l].effect);
		}
	}
	return eff;
}

function globalUpgEffect(target) {
	let eff = new Decimal(1);
	for (let l in layers) {
		if (!tmp[l].upgrades) continue;
		for (let r=1;r<=tmp[l].upgrades.rows;r++) {
			for (let c=1;c<=tmp[l].upgrades.cols;c++) {
				let id = r*10+c;
				if (!hasUpgrade(l, id)) continue;
				if (tmp[l].upgrades[id].et == target) {
					if (target!="NONE"?tmp[target].type=="static":false) eff = eff.div(tmp[l].upgrades[id].effect);
					else eff = eff.times(tmp[l].upgrades[id].effect);
				}
			}
		}
	}
	return eff;
}

function globalBuyableEffect(target) {
	let eff = new Decimal(1);
	for (let l in layers) {
		if (!tmp[l].buyables) continue;
		for (let r=1;r<=tmp[l].buyables.rows;r++) {
			for (let c=1;c<=tmp[l].buyables.cols;c++) {
				let id = r*10+c;
				if (tmp[l].buyables[id].et == target) {
					if (target!="NONE"?tmp[target].type=="static":false) eff = eff.div(tmp[l].buyables[id].effect);
					else eff = eff.times(tmp[l].buyables[id].effect);
				}
			}
		}
	}
	return eff;
}
