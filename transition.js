let APARAM = 0;

class Transition {
	constructor(from, to){
		this.from = from;
		this.to = to;
		this.text = '';
		this.angle = 0;
		this.starting = false;
	}

	draw(highlight){
		// this.angle = 0.01*frameCount%(2*Math.PI);

		if(this.angle == 0){
			this.angle = 1e-10;
		}
		
		if(highlight){
			stroke(0, 0, 255);
		}else{
			stroke(0);
		}
		strokeWeight(lineStrength);
		noFill();

		let displayText = prettyText(this.text);
		if(highlight){
			displayText += '|';
		}

		if(this.isSelf()){ // Self transition
			let centerOffset = selfArrowOffset*this.from.size/2;
			//ellipse(this.from.x+centerOffset*Math.cos(this.angle), this.from.y+centerOffset*Math.sin(this.angle), 8);

			let a = this.from.size/2;
			let k = centerOffset;
			let t = this.angle;
			let b = selfArrowSize;

			let mX = 0;
			let mY = 0;
			let mbX = 0;
			let mbY = 0;
			let sqA = -k*k*(Math.pow(a,4)+Math.pow(b*b-k*k, 2)-2*a*a*(b*b+k*k))*Math.pow(Math.sin(t),2);
			let sqB = Math.sqrt(sqA);
			let start = k*(a*a-b*b+k*k);
			if(t>Math.PI){
				mX = (start*Math.cos(t)+sqB)/(2*k*k);
				mY = (start*Math.sin(t)-mathcot(t)*sqB)/(2*k*k);
				mbX = (start*Math.cos(t)-sqB)/(2*k*k);
				mbY = (start*Math.sin(t)+mathcot(t)*sqB)/(2*k*k);
			}else{
				mbX = (start*Math.cos(t)+sqB)/(2*k*k);
				mbY = (start*Math.sin(t)-mathcot(t)*sqB)/(2*k*k);
				mX = (start*Math.cos(t)-sqB)/(2*k*k);
				mY = (start*Math.sin(t)+mathcot(t)*sqB)/(2*k*k);
			}

			//ellipse(this.from.x+mX, this.from.y+mY, 8);
		
			let cX = this.from.x+centerOffset*Math.cos(this.angle);
			let cY = this.from.y+centerOffset*Math.sin(this.angle);
			
			let startAngle = Math.PI+Math.atan2(mY, mX)-0.05;
			let endAngle = Math.PI+Math.atan2(mbY, mbX)+0.05;

			noFill();
			arc(cX, cY, selfArrowSize*2, selfArrowSize*2, startAngle, endAngle);

			noStroke();
			if(highlight){
				fill(0, 0, 255);
			}else{
				fill(0);
			}
			let deltaX = (this.from.size/2)*Math.cos(Math.atan2(mY, mX)-0.05);
			let deltaY = (this.from.size/2)*Math.sin(Math.atan2(mY, mX)-0.05);
			let dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
			let normalH = (this.from.size+arrowHeadHeight)/(2*dist);
			let hX = deltaX*normalH;
			let hY = deltaY*normalH;
			let rNormal = arrowHeadHeight/(2*Math.sqrt(3)*dist);
			let rX = -deltaY*rNormal;
			let rY = deltaX*rNormal;
			triangle(this.from.x+mX, this.from.y+mY, this.from.x+hX+rX, this.from.y+hY+rY, this.from.x+hX-rX, this.from.y+hY-rY);

			textSize(0.8*fontSize);
			textFont('Times New Roman');

			let textW = textWidth(displayText+" ")/2;
			let textH = textLeading()/2;

			let aCos = Math.cos(this.angle);
			let aSin = Math.sin(this.angle);

			let rotOffset = Math.sqrt(Math.pow(textW*aCos, 2)+Math.pow(textH*aSin, 2));

			let textOffset = centerOffset + selfArrowSize + rotOffset;
			let textX = this.from.x+textOffset*aCos;
			let textY = this.from.y+textOffset*aSin;

			noStroke();
			if(highlight){
				fill(0, 0, 255);
			}else{
				fill(0);
			}
			textAlign(CENTER, CENTER);
			text(displayText, textX, textY);
		}else{ // Node to node transition
			let lineCenterX = (this.from.x+this.to.x)/2;
			let lineCenterY = (this.from.y+this.to.y)/2;

			let dist = nodeDistance(this.from, this.to);
			let deltaX = this.to.x-this.from.x;
			let deltaY = this.to.y-this.from.y;
			let aNormal = this.from.size/(2*dist);
			let aX = aNormal*deltaX;
			let aY = aNormal*deltaY;
			let bNormal = this.to.size/(2*dist);
			let bX = bNormal*deltaX;
			let bY = bNormal*deltaY;

			let doCurve = this.shouldCurve();

			if(doCurve){
				let arrowNormalX = lineCenterX - arrowBend*deltaY/dist;
				let arrowNormalY = lineCenterY + arrowBend*deltaX/dist;
				drawQuadCurve(this.from.x+aX, this.from.y+aY, this.to.x-bX, this.to.y-bY, arrowNormalX, arrowNormalY);
			}else{
				line(this.from.x+aX, this.from.y+aY, this.to.x-bX, this.to.y-bY);
			}


			if(doCurve){
				noStroke();
				if(highlight){
					fill(0, 0, 255);
				}else{
					fill(0);
				}

				let arrowNormalX = lineCenterX - arrowBend*deltaY/dist;
				let arrowNormalY = lineCenterY + arrowBend*deltaX/dist;
				let endTangX = quadTanget(1, this.from.x+aX, arrowNormalX, this.to.x-bX);
				let endTangY = quadTanget(1, this.from.y+aY, arrowNormalY, this.to.y-bY);
				let normalizer = Math.sqrt(endTangX*endTangX + endTangY*endTangY);
				endTangX *= 1/normalizer;
				endTangY *= 1/normalizer;

				let cNormal = (arrowHeadHeight/2);
				let cX = cNormal*endTangX;
				let cY = cNormal*endTangY;
				let dNormal = arrowHeadHeight/(2*Math.sqrt(3));
				let dX = -endTangY*dNormal;
				let dY = endTangX*dNormal;

				triangle(this.to.x-bX, this.to.y-bY, this.to.x-bX-cX-dX, this.to.y-bY-cY-dY, this.to.x-bX-cX+dX, this.to.y-bY-cY+dY);
			}else{
				let cNormal = (this.to.size+arrowHeadHeight)/(2*dist);
				let cX = cNormal*deltaX;
				let cY = cNormal*deltaY;
				let dNormal = arrowHeadHeight/(2*Math.sqrt(3)*dist);
				let dX = -deltaY*dNormal;
				let dY = deltaX*dNormal;
				noStroke();
				if(highlight){
					fill(0, 0, 255);
				}else{
					fill(0);
				}
				triangle(this.to.x-bX, this.to.y-bY, this.to.x-cX-dX, this.to.y-cY-dY, this.to.x-cX+dX, this.to.y-cY+dY);
			}

			textSize(0.8*fontSize);
			textFont('Times New Roman');

			let textX;
			let textY;

			if(this.starting){
				let textW = textWidth(displayText+" ")/2;
				let textH = textLeading()/2;
				let arrAngle = (2*Math.PI+Math.atan2(deltaY, deltaX))%(2*Math.PI);
				let textDist = Math.abs(Math.cos(arrAngle)*textW) + Math.abs(Math.sin(arrAngle)*textH);

				let tNormal = textDist/dist;

				textX = this.from.x - deltaX*tNormal;
				textY = this.from.y - deltaY*tNormal;
			}else{
				let textW = textWidth(displayText+" ")/2;
				let textH = textLeading()/2;
				let arrAngle = (2*Math.PI+Math.atan2(deltaY, deltaX))%(2*Math.PI);
				let textDist = Math.abs(Math.cos(arrAngle)*textH) + Math.abs(Math.sin(arrAngle)*textW);

				let tNormal = textDist/dist;
				if(doCurve){
					let arrowNormalX = lineCenterX - arrowBend*deltaY/dist;
					let arrowNormalY = lineCenterY + arrowBend*deltaX/dist;
					let curveCenterX = quadCurve(0.5, this.from.x+aX, arrowNormalX, this.to.x-bX);
					let curveCenterY = quadCurve(0.5, this.from.y+aY, arrowNormalY, this.to.y-bY);
					textX = -deltaY*tNormal + curveCenterX;
					textY = deltaX*tNormal + curveCenterY;
				}else{
					textX = -deltaY*tNormal + lineCenterX;
					textY = deltaX*tNormal + lineCenterY;
				}
			}

			noStroke();
			if(highlight){
				fill(0, 0, 255);
			}else{
				fill(0);
			}
			textAlign(CENTER, CENTER);
			
			text(displayText, textX, textY);
		}
	}

	inRange(x0, y0){
		if(this.isSelf()){
			let centerOffset = selfArrowOffset*this.from.size/2;
			let cX = this.from.x+centerOffset*Math.cos(this.angle);
			let cY = this.from.y+centerOffset*Math.sin(this.angle);

			return distance(x0, y0, cX, cY) < selfArrowSize*1.1;
			
		}if(this.shouldCurve()){

			let lineCenterX = (this.from.x+this.to.x)/2;
			let lineCenterY = (this.from.y+this.to.y)/2;

			let dist = nodeDistance(this.from, this.to);
			let deltaX = this.to.x-this.from.x;
			let deltaY = this.to.y-this.from.y;
			let aNormal = this.from.size/(2*dist);
			let aX = aNormal*deltaX;
			let aY = aNormal*deltaY;
			let bNormal = this.to.size/(2*dist);
			let bX = bNormal*deltaX;
			let bY = bNormal*deltaY;

			let arrowNormalX = lineCenterX - arrowBend*deltaY/dist;
			let arrowNormalY = lineCenterY + arrowBend*deltaX/dist;
			let checkDistance = slowQuadDistance(x0, y0, this.from.x+aX, this.from.y+aY, arrowNormalX, arrowNormalY, this.to.x-bX, this.to.y-bY);
			
			let curveCenterX = quadCurve(0.5, this.from.x+aX, arrowNormalX, this.to.x-bX);
			let curveCenterY = quadCurve(0.5, this.from.y+aY, arrowNormalY, this.to.y-bY);
			
			let centDist = distance(x0, y0, curveCenterX, curveCenterY);
			if(centDist<textWidth(this.text)){
				return checkDistance < 1.2*fontSize;
			}

			return checkDistance < arrowRange;

		}else{
			let x1 = this.from.x;
			let y1 = this.from.y;
			let x2 = this.to.x;
			let y2 = this.to.y;
			let dist = segmentDistance(x0, y0, x1, y1, x2, y2);

			let centDist = distance(x0, y0, (x1+x2)/2, (y1+y2)/2);
			if(centDist<textWidth(this.text)){
				return dist < 1.2*fontSize;
			}

			return dist < arrowRange;
		}
	}

	isSelf(){
		return this.from == this.to;
	}

	shouldCurve(){
		for(let transition of transitions){
			if(transition == this)
				continue;
			if(transition.from == this.to && transition.to == this.from){
				return true;
			}
		}

		return false;
	}
}