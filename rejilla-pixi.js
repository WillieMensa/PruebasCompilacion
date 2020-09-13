////////////////////////////////////////////////////////////////////////////////////////
//solamente para depurar
//-------------------------------------------
function DibujaGrilla() {
//-------------------------------------------
const style = new PIXI.TextStyle({
	fontFamily: FONT_NIVEL3,						//fontFamily: "Sriracha",
	fontSize: 12,
	fill: "gray"
});

var offset = undefined,
	salto = 50,
	line = new PIXI.Graphics();

	// set a fill and line style
	line.lineStyle(1, "#bbbbbbb", 0.5);

	//lineas verticales
	offset = salto;
	//console.log( 'offset, window.innerWidth: ' + offset + ', ' + window.innerWidth );
	while ( offset < window.innerWidth ) {
	//console.log('window.innerHeight, offset: ' + window.innerHeight + ', ' + offset );
	line.moveTo(offset, 0);
	line.lineTo(offset, window.innerHeight );

	app.stage.addChild(line);

	var numText = new PIXI.Text(offset, style );
	numText.x = offset;
	numText.y = 20;
	app.stage.addChild(numText);

	offset += salto;
	}

	//lineas horizontales
	offset = salto;
	while ( offset < window.innerHeight ) {
	line.moveTo(0, offset);
	line.lineTo(window.innerWidth, offset );
	app.stage.addChild(line);

	var numText = new PIXI.Text(offset, style );
	numText.x = 20;
	numText.y = offset;
	app.stage.addChild(numText);

	offset += salto;
	}

}



