class Arrow{
	static drawArrow(ctx, pFrom, pTo, parent, type = 0, angle = Math.PI / 6, length = 30){
		if(type === 0){
			return;
		}

        let vec = pTo.getClone().sub(pFrom).normalize();
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        let p0 = new GVector2f(pTo.x, pTo.y);
        let p1 = new GVector2f(pTo.x - (vec.x * cos - vec.y * sin) * length,
							   pTo.y - (vec.x * sin + vec.y * cos) * length);
        let p2 = new GVector2f(pTo.x - (vec.x * cos + vec.y * sin) * length,
							   pTo.y + (vec.x * sin - vec.y * cos) * length);

        let p3 = new GVector2f(((pTo.x - ((vec.x * cos - vec.y * sin) * length << 1)) + (pTo.x - ((vec.x * cos + vec.y * sin) * length << 1))) >> 1,
							   ((pTo.y - ((vec.x * sin + vec.y * cos) * length << 1)) + (pTo.y + ((vec.x * sin - vec.y * cos) * length << 1))) >> 1);

		switch(type){
			case 2211:
				doLine({
					points: [[p1, p0],
					    	 [p2, p0]],
					borderColor: parent.borderColor,
					borderWidth: parent.borderWidth,
					ctx: ctx
				});
				break;
			case 2212:
				doPolygon({
					points: [p0, p1, p2],
					fill:true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: "white", //parent.fillColor,
					borderWidth: parent.borderWidth,
					ctx: ctx
				});
				break;
			case 2213:
				doPolygon({
					points: [p0, p1, p2],
					fill:true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.borderColor,
					borderWidth: parent.borderWidth,
					ctx: ctx
				});
				break;
			case 2214:
				doPolygon({
					points: [p1, p0, p2, p3],
					fill: true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: "white", //parent.fillColor,
					borderWidth: parent.borderWidth,
					ctx: ctx
				});
				break;
			case 2215:
				doPolygon({
					points: [p1, p0, p2, p3],
					fill: true,
					draw: true,
					borderColor: parent.borderColor,
					fillColor: parent.borderColor,
					borderWidth: parent.borderWidth,
					ctx: ctx
				});
				break;
		}
	}
}