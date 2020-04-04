const scaler = 2;

const lineStrength = 1.5*scaler;
const nodeSize = 74*scaler;
const fontSize = 24*scaler;
const arrowHeadHeight = 20*scaler;
const selfArrowSize = 28*scaler;
const selfArrowOffset = 1.25;
const arrowRange = 14*scaler;
const arrowBend = 50*scaler;

p5.disableFriendlyErrors = true; // disables FES for performance boost

let nodes = [];
let transitions = [];

let wordInput;
let currentWord = '';
let alphabet = '';

function setup(){
	let canvas = createCanvas(1000*scaler, 800*scaler);
	canvas.parent(document.querySelector("#cnv"));

	setupDocument();
}

let selectedNode;
let selectedTransition;

function draw(){
	background(255);

	for(let transition of transitions){
		transition.draw(transition == selectedTransition);
	}

	wordInput.style.backgroundColor = null;
	let currentNode = getFinalState(currentWord);
	if(currentNode){
		if(currentNode.accepting){
			wordInput.style.backgroundColor = 'rgb(154, 255, 105)';
		}else{
			let isTrapping = true;
			for(let transition of transitions){
				if(transition.from == currentNode){
					if(!transition.isSelf() || transition.text != '*'){
						isTrapping = false;
						break;
					}
				}
			}
			if((currentNode.trapping || isTrapping) && !currentNode.accepting){
				wordInput.style.backgroundColor = 'rgb(255, 105, 105)';
			}
		}
	}

	for(let node of nodes){
		node.draw(node == selectedNode, node == currentNode);
	}
}

let nodeTarget;
let transitionTarget;
let movingTarget = true;
let draggedTarget = false;
let startingArrow = false;
let drawingArrow = false;

function mousePressed(){

	if(selectedNode != undefined){
		selectedNode = undefined;
	}

	if(selectedTransition != undefined){
		selectedTransition = undefined;
	}

	for(let node of nodes){
		if(distance(node.x, node.y, mouseX, mouseY) < node.size/2){
			nodeTarget = node;
			if(keyIsDown(SHIFT)){
				transitions.push(new Transition(node, new FloatingNode(mouseX, mouseY)));
				drawingArrow = true;
			}else{
				movingTarget = true;
			}
			return;
		}
	}

	for(let transition of transitions){
		if(transition.inRange(mouseX, mouseY)){
			transitionTarget = transition;
			movingTarget = true;
			return;
		}
	}

	if(nodeTarget == undefined && transitionTarget == undefined && keyIsDown(SHIFT)){
		let startTransition = new Transition(new FloatingNode(mouseX, mouseY), new FloatingNode(mouseX, mouseY));
		startTransition.starting = true;
		transitions.push(startTransition);
		drawingArrow = true;
		startingArrow = true;
	}
}

function mouseReleased(){	
	let toNode;
	for(let node of nodes){
		if(distance(node.x, node.y, mouseX, mouseY) < node.size/2){
			toNode = node;
			break;
		}
	}

	let selTransition;
	for(let transition of transitions){
		if(transition.inRange(mouseX, mouseY)){
			selTransition = transition;
			break;
		}
	}

	if(drawingArrow){
		if(toNode != undefined){
			transitions[transitions.length-1].to = toNode;
			if(!transitions[transitions.length-1].starting){
				selectedTransition = transitions[transitions.length-1];
			}
		}else{
			transitions.pop();
		}
	}

	if(!draggedTarget){
		if(toNode != undefined){
			selectedNode = toNode;
		}else if(selTransition != undefined){
			selectedTransition = selTransition;
		}
	}

	nodeTarget = undefined;
	transitionTarget = undefined;
	draggedTarget = false;
	movingTarget = false;
	startingArrow = false;
	drawingArrow = false;
}

function mouseDragged(){
	draggedTarget = true;

	if(nodeTarget != undefined){
		if(movingTarget){
			nodeTarget.x = mouseX;
			nodeTarget.y = mouseY;
		}else{
			let toNode;
			for(let node of nodes){
				if(distance(node.x, node.y, mouseX, mouseY) < node.size/2){
					toNode = node;
					break;
				}
			}
			if(toNode != undefined){
				transitions[transitions.length-1].to = toNode;
			}else{
				transitions[transitions.length-1].to = new FloatingNode(mouseX, mouseY);
			}
		}
	}else if(transitionTarget != undefined){
		if(transitionTarget.isSelf()){
			transitionTarget.angle = (2*Math.PI+Math.atan2(mouseY-transitionTarget.from.y, mouseX-transitionTarget.from.x))%(2*Math.PI);
		}else if(transitionTarget.starting){
			transitionTarget.from = new FloatingNode(mouseX, mouseY);
		}
	}else if(startingArrow){
		let toNode;
		for(let node of nodes){
			if(distance(node.x, node.y, mouseX, mouseY) < node.size/2){
				toNode = node;
				break;
			}
		}
		if(toNode != undefined){
			transitions[transitions.length-1].to = toNode;
		}else{
			transitions[transitions.length-1].to = new FloatingNode(mouseX, mouseY);
		}
	}
}

function doubleClicked(){
	if(!mouseInBounds())
		return;
	
	if(selectedNode != undefined){
		selectedNode = undefined;
	}

	for(let node of nodes){
		if(distance(node.x, node.y, mouseX, mouseY) < node.size/2){
			node.accepting = !node.accepting;
			return false;
		}
	}
	nodes.push(new Node(mouseX, mouseY, nodeSize));
	return false;
}

function keyPressed(){
	if(keyCode == BACKSPACE){
		if(selectedNode != undefined){
			selectedNode.text = selectedNode.text.substring(0, selectedNode.text.length-1);
			return false;
		}else if(selectedTransition != undefined){
			selectedTransition.text = selectedTransition.text.substring(0, selectedTransition.text.length-1);
			return false;
		}
	}else if(keyCode == DELETE){
		if(selectedNode != undefined){
			for(let i = transitions.length-1; i >= 0; i--){
				if(transitions[i].from == selectedNode || transitions[i].to == selectedNode){
					transitions.splice(i, 1);
				}
			}
			for(let i = 0; i < nodes.length; i++){
				if(nodes[i] == selectedNode){
					nodes.splice(i, 1);
					selectedNode = undefined;
					break;
				}
			}
		}else if(selectedTransition != undefined){
			for(let i = 0; i < transitions.length; i++){
				if(transitions[i] == selectedTransition){
					transitions.splice(i, 1);
					selectedTransition = undefined;
					break;
				}
			}
		}
	}else if(keyCode == RIGHT_ARROW && keyIsDown(SHIFT)){
		if(selectedTransition != undefined){
			selectedTransition.text += ", \u05d9\u05de\u05d9\u05df";
		}
	}else if(keyCode == LEFT_ARROW && keyIsDown(SHIFT)){
		if(selectedTransition != undefined){
			selectedTransition.text += ", \u05e9\u05de\u05d0\u05dc";
		}
	}
}

function keyTyped(){
	if(selectedNode != undefined){
		selectedNode.text += key;
		return false;
	}else if(selectedTransition != undefined){
		selectedTransition.text += key;
		return false;
	}
}

function setupDocument(){
	wordInput = document.querySelector("#currentWord");
	wordInput.addEventListener('input', (e) => {
		currentWord = e.target.value;
	});

	const exportModal = document.querySelector("#exportModal");
	document.querySelector("#exportBtn").addEventListener('click', (e) => {
		exportModal.querySelector("#modalTitle").innerText = "Export DFA Model";
		exportModal.querySelector("#modalDescription").innerText = "Copy this serialized data and save it:";
		exportModal.querySelector("#modalTextbox").value = getStringOfGraph();
		exportModal.querySelector("#modalButton").value = "Copy to clipboard";
		exportModal.querySelector("#modalButton").onclick = () => {
			exportModal.querySelector("#modalTextbox").select();
			document.execCommand("copy");
			exportModal.style.display = "none";
		};	
		exportModal.style.display = "block";
	});
	document.querySelector("#importBtn").addEventListener('click', (e) => {
		exportModal.querySelector("#modalTitle").innerText = "Import DFA Model";
		exportModal.querySelector("#modalDescription").innerText = "Paste the serialized data and click the button:";
		exportModal.querySelector("#modalTextbox").value = "";
		exportModal.querySelector("#modalButton").value = "Import DFA";
		exportModal.querySelector("#modalButton").onclick = () => {
			let data = exportModal.querySelector("#modalTextbox").value;
			if(data && data.trim().length != 0){
				loadGraphFromString(data.trim());
			}
			exportModal.style.display = "none";
		};	
		exportModal.style.display = "block";
		setTimeout(() => {
			exportModal.querySelector("#modalTextbox").focus();
		}, 0);
	});
	document.querySelector("#clearBtn").addEventListener('click', (e) => {
		nodes = [];
		transitions = [];
	});
	document.querySelector("#lintButton").addEventListener('click', (e) => {
		alphabet = prompt("Enter a comma seperated alphabet: ", alphabet);
		if(alphabet && alphabet.trim().length != 0){
			checkForErrors(alphabet);
		}else{
			alphabet = '';
		}
	});
}

function mouseInBounds(){
	return mouseX>=0 && mouseY>=0 && mouseX<width && mouseY<height;
}

function getFinalState(word){
	let startingNode;
	for(let transition of transitions){
		if(transition.starting){
			startingNode = transition.to;
			break;
		}
	}

	if(startingNode != undefined){
		return getFinalStateHelper(word, startingNode);
	}else{
		return new TrappingNode();
	}
}

function getFinalStateHelper(word, curNode){
	if(word.length == 0){
		return curNode;
	}

	let outTransitions = [];

	for(let transition of transitions){
		if(transition.from == curNode){
			outTransitions.push(transition);
		}
	}

	let outTrans = findValidTransition(outTransitions, word[0]);
	if(outTrans){
		return getFinalStateHelper(word.substring(1), outTrans.to);
	}else{
		return new TrappingNode();
	}
}

function findValidTransition(transitionSet, letter){
	for(let out of transitionSet){
		if(out.text.length == 0){
			continue;
		}

		for(let verb of out.text.split(',')){
			verb = verb.trim();
			if(verb == '*' || verb == letter){
				return out;
			}else if(verb.length == 3 && verb[1] == '-'){
				let begin = verb.charCodeAt(0);
				let end = verb.charCodeAt(2);
				let num = letter.charCodeAt(0);
				if(begin <= num && num <= end){
					return out;
				}
			}
		}
	}
}

function getStringOfGraph(){
	let nodesString = JSON.stringify(nodes);
	let transObjects = [];

	for(let transition of transitions){
		let obj = Object.assign({}, transition);
		obj.from = -1;
		obj.to = -1;
		for(let i = 0; i < nodes.length; i++){
			if(transition.from == nodes[i]){
				obj.from = i;
			}
			if(transition.to == nodes[i]){
				obj.to = i;
			}
		}
		if(obj.from == -1){
			obj.fromBack = transition.from;
		}

		transObjects.push(obj);
	}
	let transString = JSON.stringify(transObjects);
	let fullString = JSON.stringify({'nodes': nodesString, 'transitions': transString});
	return btoa(fullString);
}

function loadGraphFromString(str){
	let tempNodes = [];
	let tempTransitions = [];

	let fullJson = JSON.parse(atob(str));
	let nodesJson = JSON.parse(fullJson.nodes);

	for(let rep of nodesJson){
		let tempNode = Object.assign(new Node(), rep);
		tempNode.errorHighlight = false;
		tempNodes.push(tempNode);
	}

	let transJson = JSON.parse(fullJson.transitions);

	for(let rep of transJson){
		let preTrans = Object.assign(new Transition(), rep);
		
		if(rep.from == -1){
			preTrans.from = Object.assign(new FloatingNode(), rep.fromBack);
		}else{
			preTrans.from = tempNodes[rep.from];
		}

		preTrans.to = tempNodes[rep.to];
		tempTransitions.push(preTrans);
	}

	nodes = tempNodes;
	transitions = tempTransitions;
}

function checkForErrors(txtAlphabet){
	let letters = txtAlphabet.split(',');
	for(let node of nodes){
		let letterCount = 0;
		let outTransitions = [];
		for(let transition of transitions){
			if(transition.from != node) continue;
			outTransitions.push(transition);
		}
		for(let letter of letters){
			if(findValidTransition(outTransitions, letter)){
				letterCount++;
			}
		}

		node.errorHighlight = (letterCount != letters.length);
	}
}

function prettyText(displayText){
	const subScriptChars = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
	const greekDict = {'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ', 'iota': 'ι', 'kappa': 'κ', 'lamda': 'λ', 'mu': 'μ', 'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο', 'pi': 'π', 'rho': 'ρ', 'final': 'ς', 'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ', 'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω', 'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ', 'Epsilon': 'Ε', 'Zeta': 'Ζ', 'Eta': 'Η', 'Theta': 'Θ', 'Iota': 'Ι', 'Kappa': 'Κ', 'Lamda': 'Λ', 'Mu': 'Μ', 'Nu': 'Ν', 'Xi': 'Ξ', 'Omicron': 'Ο', 'Pi': 'Π', 'Rho': 'Ρ', 'Sigma': 'Σ', 'Tau': 'Τ', 'Upsilon': 'Υ', 'Phi': 'Φ', 'Chi': 'Χ', 'Psi': 'Ψ', 'Omega': 'Ω', 'bot': '⊥', 'vdash': '⊢'};

	for(let i = 100; i >= 0; i--){
		let subText = '';
		for(let num of (''+i)){
			subText += subScriptChars[parseInt(num)];
		}
		displayText = displayText.replace(new RegExp('_'+i,'g'), subText);
	}
	for(let name in greekDict){
		displayText = displayText.replace(new RegExp('\\\\'+name,'g'), greekDict[name]);
	}
	return displayText;
}

function nodeDistance(a, b){
	return Math.sqrt(Math.pow(b.x-a.x, 2)+Math.pow(b.y-a.y, 2));
}

function distance(ax, ay, bx, by){
	return Math.sqrt(Math.pow(ax-bx, 2) + Math.pow(ay-by, 2));
}

function mathcot(x){
	return 1/Math.tan(x);
}

function quadCurve(t, p0, p1, p2){
	return Math.pow(1-t, 2)*p0 + 2*t*(1-t)*p1 + Math.pow(t, 2)*p2;
}

function quadTanget(t, p0, p1, p2){
	return 2*(p2*t - p0*(1-t) + p1*(1-2*t));
}


function slowQuadDistance(cx, cy, p0x, p0y, p1x, p1y, p2x, p2y){
	const SAMPLE_RESOLUTION = 60;
	let minSqrDistance = Infinity;
	for(let i = 0; i <= SAMPLE_RESOLUTION; i++){
		let t = i/SAMPLE_RESOLUTION;
		let evalPointX = quadCurve(t, p0x, p1x, p2x);
		let evalPointY = quadCurve(t, p0y, p1y, p2y);
		let sqrDistance = Math.pow(cx-evalPointX, 2) + Math.pow(cy-evalPointY, 2);
		if(sqrDistance < minSqrDistance){
			minSqrDistance = sqrDistance;
		}
	}
	return Math.sqrt(minSqrDistance);
}

function drawQuadCurve(ax, ay, bx, by, cx, cy){
	const SAMPLE_RESOLUTION = 20;
	beginShape();
	for(let i = 0; i <= SAMPLE_RESOLUTION; i++){
		let t = i/SAMPLE_RESOLUTION;
		let vX = quadCurve(t, ax, cx, bx);
		let vY = quadCurve(t, ay, cy, by);
		vertex(vX, vY);
	}
	endShape();
}

function segmentDistance(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
