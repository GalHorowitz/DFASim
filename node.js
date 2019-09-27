class Node {
	constructor(x, y, size){
		this.size = size;
		this.x = x;
		this.y = y;
		this.text = 'q_'+nodes.length;
		this.accepting = false;
		this.errorHighlight = false;
	}

	draw(highlight, current){
		if(highlight){
			stroke(0, 0, 255);
		}else{
			stroke(0);
		}
		
		if(current){
			fill(122, 207, 207);
		}else{
			fill(255);
		}

		if(this.errorHighlight){
			fill(209, 88, 88);
		}
		
		strokeWeight(lineStrength);
		ellipse(this.x, this.y, this.size);
		if(this.accepting){
			ellipse(this.x, this.y, this.size*0.85);
		}

		noStroke();
		if(highlight){
			fill(0, 0, 255);
		}else{
			fill(0);
		}
		textAlign(CENTER, CENTER);
		textSize(fontSize);
		textFont('Times New Roman');

		let displayText = prettyText(this.text);

		if(highlight){
			displayText += '|';
		}

		text(displayText, this.x, this.y);
	}
}

class FloatingNode {
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.size = 0;
	}
}

class TrappingNode {
	constructor(){
		this.accepting = false;	
		this.trapping = true;
	}
}