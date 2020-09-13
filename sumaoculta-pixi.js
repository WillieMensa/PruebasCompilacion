/*	
	sumaoculta-pixi.js
	2020 .09.07 - version 0.5.3
	Intento corregir las posiciones para que la escena quede centrada

	2020 .09.07 - version 0.5.2
	Evolucion a partir de sumaoculta-pixi-04.js
	el tablero de juego no se redimensiona con la pantalla, los otros elementos (containers) si.
	solucion?: incorporo un container que cargará todos los demas.
	EscenarioGral = undefined,			//	container del total (1er nivel) contenedor de contenedores

*/


"use strict";

// ------- definicion constantes y variables --------
const
	VERSION = "0.5.3",			//  lleva el numero de version actual
	CLR_FONDO = 0x114422,		//	var BACKGROUND_COLOR = '#113322';	// "#446622";	//	"#ddff99";
	CLR_PIEZA = 0xeeeedd,
	CLR_BOTONES = 0x669900,	//		background: #669900;
	CLR_TEXTO = 0x113322,		// "0x446644"
	CLR_TXTCLARO = 0xeeeecc,		// "0x446644"
	CLR_TXTBOT = 0x111111,	// "0x446644"
	CLR_TITULO = '#8a2',
	FONDO_AYUDA = 0xffff88,
	NDIG = 10,							//	cantidad de dígitos
	NRO_PROB = 50,
	STAGE_X = 800,				// ancho del canvas (utilizar siempre el mismo nombre) antes RENDERER_W
	STAGE_Y = 800,				// alto del canvas
	NCELDAS_X = 10,				// cantidad de celdas en direccion X
	CELDAS_START_X = 125,	// coordenadas inicio area de celdas.
	//	CELDAS_START_Y = 220,
	//	PASO_X = 50,					// distanciamiento horizontal de las celdas
	PRECISION = 25,				// Precision: max distancia para detectar celda de destino
	FILA_A = 200,					// primer fila de celditas
	FILA_B = 260,					// segunda fila para 'escribir solucion'. Casillas destino
	FILA_C = 340,					// tercera fila, origen piezas-numeros. Casillas origen.
	FILA_D = 450,					// primer sumando
	FILA_E = 510,					// segundo sumando
	FILA_F = 580,					// suma
	LADO = 50,						// lado de las celditas
	// las que siguen son tomadas del sumado
	LIMITE_TABLERO = 900,
	LINEA_BOTONES = 500,
	nESCALA = 1,					//	1.23,
	//	TABLERO_OFF_X = 58,		//	Vertice sup izq del tablero
	//	TABLERO_OFF_Y = 58,
	DEBUG = false,
	//	DEBUG = true,
	xFake = "";				

//	fonts para textos
const
	FONT_NIVEL1 = 'titanone',			//	"luckiest_guyregular",
	FONT_NIVEL2 = "fredokaone",	
	FONT_NIVEL3 = "robotoregular";

let 
	Crono = undefined,
	elapsed = undefined,
	EscenaDeAyudas = undefined,			//	container ayudas
	EscenaDeJuego = undefined,			//	container juego
	EscenaFinJuego = undefined,			//	container aviso de fin del juego
	MessageFin = undefined,			//	container aviso de fin del juego
	EscenaMenuInic = undefined,			//	container pantalla de inicio
	EscenaSobre = undefined,				//	container de estadisticas
	id = undefined,
	pointer = undefined,
	start = undefined,
	state = undefined, 
	grupoSelector,										//  componente para seleccion nro de problema
	CANTPROBLEMAS = problemas.length,	//	problemas en al array .json
	imgNroProb,												//	imagen del nro de problema en la seleccion
	ratio,														// relacion entre dimension pantalla y stage
	nroProbActual;										//	nro problema actual (el valor)
	


// Aliases
let 
	Application = PIXI.Application,
	autoDetectRenderer = PIXI.autoDetectRenderer,
	Container = PIXI.Container,
	Graphics = PIXI.Graphics,
	loader = PIXI.Loader.shared, // PixiJS exposes a premade instance for you to use.
	Rectangle = PIXI.Rectangle,
	resources = loader.resources,
	Sprite = PIXI.Sprite,
	Text = PIXI.Text,
	Texture = PIXI.Texture,
	TextureCache = PIXI.utils.TextureCache;


//Create pixi application objects
let app = new Application({
		width: STAGE_X, height: STAGE_Y, 
		antialias: true,
		transparent: false,
		resolution: window.devicePixelRatio || 1,
		autoResize: true,
		//	resizeTo: true,
		backgroundColor: CLR_FONDO
});



let 
	EscenarioGral = new Container(),	// EscenarioGral (stage) es el contenedor de las escenas del juego  
	mensajeDin = new Container();			//	contenedor para mensaje dinamico

// Put the renderer on screen in the corner
app.view.style.position = "absolute";
app.view.style.top = "0px";
app.view.style.left = "0px";


//Add application objects to dom
document.body.appendChild(app.view);
//Load the json file and execute the setup function after loading. Note the json file path here, as well as the following
loader.add("./images/sumaoculta.json").load(setup);

//Define some variables that need to be used
//	let dungeon, explorer, treasure, door, textureId, letra;
let
	aCasaDest = [					//	array con datos casillas destino.
												//	letra, disponible: true / false, digito colocado
												//	letra no serÃ­a necesaria porque coincide con cLetrasA
		{fijo:true,   digito: 0},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1},
		{fijo:false,  digito:-1}
	],
	aNumeros = [],					//	array con las pieza-numeros
	cLetrasA = 'ABCDEFGHIJ',//	cadena de letras del problema
	cLetrasB = "QWRTYUIOPM",
	cLetrasC = "ASDFGHJKLJ˜",
	cNumA = '0123456789', 
	cNumB = '9876543210',
	cNumC = '9999999999',		//	cadenas de diez digitos
	textureId,
	aPiezas = Array(NDIG),
	//	nFilaProblema = 2,
	fake;


let						//	variables para imagenes del atlas
	btnAjustes,	btnAyuda,	btnInicio, btnJugar,	btnSalida, btnAcerca, 
	logotipo, casilla, titulo;


// Variables used in more than one function. SUMADO
//==================
// BEGIN
//==================
//	window.onload = function(){
//		init();
//	//		setup();
//	};




function setup() {
	//	Preparacion general
	//	Create an alias for the texture atlas frame ids
	//	id = PIXI.loader.resources["images/sumadotileset.json"].textures;
	//	id = loader.resources["images/sumadotileset.json"].textures;

	console.log('app.view.width: ', app.view.width);
	// Size the renderer to fill the screen
	resize(); 

	// Listen for and adapt to changes to the screen size, e.g.,
	// user changing the window or rotating their device
	window.addEventListener("resize", resize);
	
	
	//	container del total (1er nivel)
	app.stage.addChild(EscenarioGral);

	//	Escenario menu inicial
	EscenaMenuInic = new Container();
	app.stage.addChild(EscenaMenuInic);
	//	EscenarioGral.addChild(EscenaMenuInic);

	//	Escenario menu juego
	EscenaDeJuego = new Container();
	app.stage.addChild(EscenaDeJuego);

	//Create the EscenaFinJuego
	EscenaFinJuego = new Container();
	app.stage.addChild(EscenaFinJuego);

	//	Crear escenario de ayudas
	EscenaDeAyudas = new Container();
	app.stage.addChild(EscenaDeAyudas);

	//	Crear escenario de estadisticas
	EscenaSobre = new Container();
	app.stage.addChild(EscenaSobre);


	//	Prepara los botones necesarios
	HaceBotones();


	nroProbActual = getNroProbl();
	imgNroProb.text = nroProbActual;

	//	HaceMensajeFin();

	//	Prepara las diferentes pantallas / escenas.
	//	PantallaInicio();
	//	PantallaAyuda();
	//	PantallaJugar();
	//	PantallaSobre();

	//	Una grilla para ubicarnos en el canvas
	if (DEBUG) {		DibujaGrilla()	};

	//	para probar directamente la pantalla de juego
	//	SelectorProblema();

	Menu();
	//	Jugar();
	//	Ayuda();

/*
	//	Set the initial game state
	//	state = play;
	state = Menu;

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaMenuInic.visible = true;			//	container pantalla de inicio
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenarioGral.visible = true;			//	container del juego
	EscenaDeAyudas.visible = true;
	EscenaSobre.visible = false;

	var	MessageFin = new PIXI.Text( "Solución correcta.\nFelicitaciones!", 
		{ fontFamily: "Sriracha",	fontSize: "32px", fill: "#600" });	
		MessageFin.x = 600;
		MessageFin.y = 440;
		EscenaFinJuego.addChild(MessageFin);

	//	detectar y procesar teclas pulsadas mediante 'keydown' event listener en el document
	document.addEventListener('keydown', onKeyDown);

	app.stage.addChild(EscenarioGral);

	//Start the game loop
	gameLoop();

*/

}


function PantallaInicio() {
	EscenaMenuInic.visible = true;
	
	EscenaFinJuego.visible = false;
	EscenaFinJuego.disabled  = true;

	EscenaDeJuego.visible = false;
	EscenaDeJuego.disabled  = true;

	// Here are three different ways to create sprites
	// por ahora utilizo Third kind
	//Third kind
	// con atlas de texturas
	//	textureId = PIXI.loader.resources["./images/texture.json"].textures;
	textureId = loader.resources["./images/sumaoculta.json"].textures;
	//	
	//		// variable_nombre_objeto = new Sprite(textureId["objeto.png"]);
	//		titulo = new Sprite(textureId["titulo.png"]);
	//		titulo.x = 50;				//	app.renderer.width - titulo.width - 48;
	//		titulo.y = 50;				//	app.renderer.height / 2 - titulo.height / 2;
	//		titulo.scale.set(nESCALA);				// make it a bit bigger, so it's easier to grab
	//		EscenaMenuInic.addChild(titulo);
	//	
	logotipo = new Sprite(textureId["logotipo.png"]);
	logotipo.x = 630;				//	app.renderer.width - titulo.width - 48;                
	logotipo.y = 50;				//	app.renderer.height / 2 - titulo.height / 2;           
	logotipo.scale.set(nESCALA);				// make it a bit bigger, so it's easier to grab
	EscenaMenuInic.addChild(logotipo);

	//-------------------------
	//	porque escribo directamente a lapantalla
	var richText = new PIXI.Text('SUMA\nOCULTA',
		{ fontFamily: FONT_NIVEL1,	fontSize: "96px", fill: CLR_TITULO } );
	//	'Se dan como ayuda los valores de dos vÃ©rtices.', style);
	richText.x = 50;
	richText.y = 50;
	EscenaMenuInic.addChild(richText);

	EscenaMenuInic.addChild(grupoSelector);			// gruposelector preparado en instancia anterior
	//	app.stage.addChild(titulo);

	var DebugMsg = new PIXI.Text(
		'window.innerWidth: ' + window.innerWidth +
		'\nwindow.innerHeight: ' + window.innerHeight +
		'\nratio: ' + ratio,
		{ fontFamily: FONT_NIVEL1,	fontSize: "24px", fill: '#ffeedd' } );
	//	'Se dan como ayuda los valores de dos vÃ©rtices.', style);
	DebugMsg.x = 50;
	DebugMsg.y = 300;
	EscenaMenuInic.addChild(DebugMsg);


	console.log('--- pantalla inicio ---\n' );
	//	console.trace();

	


}



function HaceMensajeFin() {					//	prepara mensaje para solucion correcta
	// let's create a moving shape
	const roundRect = new PIXI.Graphics();
	//	roundRect.lineStyle(4, 0x332211, 0.95)
	roundRect.beginFill( CLR_BOTONES, 0.9);
	roundRect.drawRoundedRect(50, 50, STAGE_X-100, 500, 40 );
	roundRect.endFill();

	MessageFin = new PIXI.Text( "Solución correcta.\nFelicitaciones!", 
		{ fontFamily: FONT_NIVEL2,	fontSize: "80px", fill: CLR_TEXTO });	
		MessageFin.x = 100;
		MessageFin.y = 200;

	mensajeDin.addChild(roundRect);
	mensajeDin.addChild(MessageFin);

	EscenaFinJuego.addChild(mensajeDin);

}



function gameLoop() {
	/*
				//Loop this function 60 times per second

				//	console.log('----- gameLoop ---------');
				requestAnimationFrame(gameLoop);
				//	Run the current state
				state();
	*/
				//Render the EscenarioGral

				//	app.renderer.render(EscenarioGral);
				

}




//	--------------------------------------
function play() {
	if ( VerificaSuma() ) {
	//	if ( true ) {
		state = end;
		//	incremento numerador para preparar problema siguiente
		if (nroProbActual < CANTPROBLEMAS ) { nroProbActual++ }
		imgNroProb.text = nroProbActual;
		setStorage("nroProblemaStored", nroProbActual);

		end();

	} else {
		//	tambien quiero verificar si colocó todas las piezas y el resultado no es correcto
		if (errorSuma())	{
			alert('Error en la suma!');
		}
		elapsed = Math.floor(( new Date().getTime() - start ) / 100 ) / 10;
	}
	Crono.text = "Tiempo: " + elapsed + " seg.";
	//	end(); //SOLO PARA PRUEBA

}





function PantallaAyuda() {		//	prepara pantalla de ayudas
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.5);
	graphics.drawRoundedRect(25, 50, STAGE_X, 400, 50);
	graphics.endFill();

	EscenaDeAyudas.addChild(graphics);

	const style = {
		fontStyle: 'italic',
		//	fontWeight: 'light',
		stroke: '#4a1850',
		strokeThickness: 1,
		dropShadow: false,
		wordWrap: true,
		wordWrapWidth: 720,
		fontFamily: FONT_NIVEL3,	
		fontSize: 24, 
		fill: CLR_TEXTO
	};
		/*
		'SUMA OCULTA es un desafío de lógica que requiere un \n' + 
		'mínimo conocimiento de aritmética para ser resuelto.\n\n' + 
		'¿En que consiste?\n' + 
		'Se presenta una una suma donde cada dígito ha sido \nreemplazado por una letra diferente.\n' + 
		'Se trata de encontrar el dígito que corresponde a cada \nletra para que la suma sea correcta.\n' + 
		'En la pantalla de inicio elige el problema a resolver ( 1 - '+ CANTPROBLEMAS + ' )\n' + 
		'Se da como ayuda el dígito asignado a una letra.'
		*/
	var richText = new PIXI.Text(
		'SUMA OCULTA es un desafío de lógica que requiere un ' + 
		'mínimo conocimiento de aritmética para ser resuelto.\n\n' + 
		'¿En que consiste?\n' + 
		'Se presenta una una suma donde cada dígito ha sido reemplazado por una letra diferente.\n' + 
		'Se trata de encontrar el dígito que corresponde a cada letra para que la suma sea correcta.\n' + 
		'En la pantalla de inicio elige el problema a resolver ( 1 - '+ CANTPROBLEMAS + ' )\n' + 
		'Se da como ayuda el dígito asignado a una letra.'
		, style);

	//	'Se dan como ayuda los valores de dos vÃ©rtices.', style);
	richText.x = 80;
	richText.y = 80;
	EscenaDeAyudas.addChild(richText);

	EscenaDeAyudas.visible = true;

	btnAyuda.disabled=true;
	btnAyuda.visible = false;

	btnJugar.disabled=true;
	btnJugar.visible = false;

	btnAcerca.disabled=true;
	btnAcerca.visible = false;

	btnInicio.visible = true;
	btnInicio.disabled=false;

	//	grupoSelector.visible = false;
	//	grupoSelector.disabled=true;

}




function PantallaJugar() {
	let
		aSpritesA = Array(NDIG),
		aSpritesB = Array(NDIG),
		aSpritesC = Array(NDIG),
		sprLetra, sprTexture, cImagen;

	//	hay que limpiar la pantalla de las piezas que quedaron
	EscenaDeJuego.removeChildren();


	Crono = new PIXI.Text( "Tiempo: ", { fontFamily: FONT_NIVEL2, fontSize: "16px", fill: CLR_TXTCLARO, fontStyle: 'italic' } );	
	Crono.position.set(625, 30 );
	EscenaDeJuego.addChild(Crono);

	const style = {
		fontStyle: 'italic',
		//	fontWeight: 'light',
		//	stroke: '#4a1850',
		//	strokeThickness: 1,
		dropShadow: false,
		wordWrap: true,
		wordWrapWidth: 500,
		fontFamily: FONT_NIVEL3,	
		fontSize: 24, 
		fill: CLR_TXTCLARO
	}
	var richText = new PIXI.Text(
		'Arrastrar las piezas con dígitos debajo de la letra correspondiente para que la suma sea correcta.', style );
		//	{ fontFamily: FONT_NIVEL3,	fontSize: "24px", fill: CLR_TXTCLARO } );
	richText.x = 50;
	richText.y = 20;
	EscenaDeJuego.addChild(richText);

	var txtNroProb = new PIXI.Text(	'Problema: ' + nroProbActual, style );
		//	{ fontFamily: FONT_NIVEL3,	fontSize: "24px", fill: CLR_TXTCLARO } );
	txtNroProb.x = 625;
	txtNroProb.y = 50;
	EscenaDeJuego.addChild(txtNroProb);

	//	linea de suma
	const lineaSuma = new PIXI.Graphics();
	lineaSuma.lineStyle(4, 0x111111, 1);
	lineaSuma.moveTo(CELDAS_START_X-75, FILA_E+35);
	lineaSuma.lineTo(700, FILA_E+35);
	EscenaDeJuego.addChild(lineaSuma);

	//	simbolo suma
	var simbolSuma = new PIXI.Text(	'+', { fontFamily: FONT_NIVEL3, fontSize: 64, fill: 0x111111} );
	simbolSuma.x = 50;
	simbolSuma.y = FILA_D;
	EscenaDeJuego.addChild(simbolSuma);

	//	simbolo igual
	var simbolIgual = new PIXI.Text(	'=', { fontFamily: FONT_NIVEL3, fontSize: 64, fill: 0x111111} );
	simbolIgual.x = 50;
	simbolIgual.y = FILA_E+30;
	EscenaDeJuego.addChild(simbolIgual);


	let aLetras = [
		'letra_A.png',	'letra_B.png',	'letra_C.png',	'letra_D.png',	'letra_E.png',
		'letra_F.png',	'letra_G.png',	'letra_H.png',	'letra_I.png',	'letra_J.png' ];


	const graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(2, 0x888888, 2);

	// creacion de los sprites fijos para letras
	for (var i = 0; i < NDIG; i++)	{
		cImagen = aLetras[i];
		sprTexture = TextureCache[cImagen];
		sprLetra = new Sprite(sprTexture);
		sprLetra.scale.set(0.6);			//	ajustar tamaÃƒÂ±o del sprite
		sprLetra.anchor.set(0.5);			//	anclaje al centro
		sprLetra.x = CELDAS_START_X+i*(10+LADO);
		sprLetra.y = FILA_A;
		EscenaDeJuego.addChild(sprLetra);		//	add objects to container

		//	letras de sumandos
		sprLetra = new Sprite(sprTexture);
		sprLetra.scale.set(0.6);			//	ajustar tamaÃƒÂ±o del sprite
		sprLetra.anchor.set(0.5);			//	anclaje al centro
		sprLetra.x = CELDAS_START_X+i*(10+LADO);
		sprLetra.y = FILA_D;
		EscenaDeJuego.addChild(sprLetra);


		// segunda fila; mostrar posición destino piezas.
		graphics.beginFill(0x88aaaa, 0.5);
		graphics.drawRoundedRect(CELDAS_START_X+ (i-0.42)*(10+LADO), FILA_B-0.42*(10+LADO), LADO, LADO, 8);
		graphics.endFill();
		EscenaDeJuego.addChild(graphics);

		//	fila de segundo sumando
		//	se presenta la letra correspondiente al dígito cNumB[i]
		//	console.log( 'aLetras[ cNumB[i] ]', cNumB[i], '--->',aLetras[ cNumB[i] ]);
		//	cImagen = aLetras[cNumB[i]];
		cImagen = aLetras[cNumA.search(cNumB[i]) ] ;
		sprTexture = TextureCache[cImagen];
		sprLetra = new Sprite(sprTexture);
		sprLetra.scale.set(0.6);			//	ajustar tamaÃƒÂ±o del sprite
		sprLetra.anchor.set(0.5);			//	anclaje al centro
		sprLetra.x = CELDAS_START_X+i*(10+LADO);
		sprLetra.y = FILA_E;
		EscenaDeJuego.addChild(sprLetra);		//	add objects to container

		cImagen = aLetras[cNumC[i]];
		sprTexture = TextureCache[cImagen];
		sprLetra = new Sprite(sprTexture);
		sprLetra.scale.set(0.6);			//	ajustar tamaÃƒÂ±o del sprite
		sprLetra.anchor.set(0.5);			//	anclaje al centro
		sprLetra.x = CELDAS_START_X+i*(10+LADO);
		sprLetra.y = FILA_F;
		EscenaDeJuego.addChild(sprLetra);		//	add objects to container

	}
	

	// creacion de los sprites draggables para cada nro
	for ( i = 0; i < NDIG; i++)
	{
		cImagen = "pieza-" + i + ".png";
		sprTexture = TextureCache[cImagen];
		sprLetra = new Sprite(sprTexture);
		sprLetra.interactive = true;		
		sprLetra.buttonMode = true;	// this button mode will mean the hand cursor appears when you roll over the num with your mouse
		sprLetra.anchor.set(0.5);		// center the num's anchor point
		sprLetra.scale.set(0.5);			//	ajustar tamaÃƒÂ±o del sprite
		sprLetra.x = CELDAS_START_X+i*(10+LADO);
		sprLetra.y = FILA_C;

		// setup events
		sprLetra
		// events for drag start
		.on('mousedown', onDragStart)
		.on('touchstart', onDragStart)
		// events for drag end
		.on('mouseup', onDragEnd)
		.on('mouseupoutside', onDragEnd)
		.on('touchend', onDragEnd)
		.on('touchendoutside', onDragEnd)
		// events for drag move
		.on('mousemove', onDragMove)
		.on('touchmove', onDragMove);

		//	add draggable objects to container
		EscenaDeJuego.addChild(sprLetra);

		aPiezas[i] = sprLetra;
		aPiezas[i].draggable = true;
		aPiezas[i].destino = -1;
		aPiezas[i].digito = i;


		//	aNumeros[i] = num;
		//	aNumeros[i].val = i;
		
		//	Make the sprites draggable
		//	aNumeros[i].draggable = true;
	}

	//	inicializar casilleros destino
	for (let i=0;i<NDIG ;i++ )	{		aCasaDest[i].digito = -1	}

	//	ubicar la pista
	i = cNumA[0];
	//	console.log( 'i: ', i );
	aPiezas[i].interactive = false;
	aPiezas[i].buttonMode = false;		// this butt
	aPiezas[i].x = CELDAS_START_X;		//	+i*(10+LADO);
	aPiezas[i].y = FILA_B;
	aCasaDest[0].digito = i;		//	asignar valor a celda destino

}



function Jugar() {
	//	var i = undefined;
	//	definir cuales son las escenas visibles y cuales invisibles

	//	getNroProbl();	
	// uso el numero almacenado: nroProbActual
	//	GenJuego();				//	generador de juegos
	leeJuegoSerie();			//	para que lea problemas ya preparados
	PantallaJugar();

	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = true;
	EscenaSobre.visible = false;
	EscenaFinJuego.visible = false;
	mensajeDin.visible = false;
	//	EscenaFinJuego.disabled=true;
	EscenaMenuInic.visible = false;

	//	console.log('--- invisivilizamos mensaje final ---');
	//	mensajeDin.visible = false;

	EscenaDeJuego.alpha = 0.99 ;

	btnJugar.disabled=true;
	btnAyuda.disabled=false;
	btnAcerca.disabled=true;
	btnInicio.disabled=true;
	btnInicio.disabled=false;

	btnJugar.visible = false;
	btnAyuda.visible = true;
	btnAcerca.visible = false;
	btnInicio.visible = false;
	btnInicio.visible = true;

	//	GenJuego()		//	genera un nuevo juego

	start = new Date().getTime();
	elapsed = 0;

	//	state = play;

}



function Menu() {
	//	definir cuales son las escenas visibles y cuales invisibles
	console.log('----- menu ---------');
	PantallaInicio();

	EscenaDeAyudas.visible = false;		//	container ayudas
	EscenaDeJuego.visible = false;
	EscenaSobre.visible = false;		//	container estadisticas
	EscenaFinJuego.visible = false;		//	container aviso de fin del juego
	EscenaMenuInic.visible = true;		//	container pantalla de inicio
	mensajeDin.visible = false;

	btnJugar.visible = true;
	btnAyuda.visible = true;
	btnAcerca.visible = true;
	btnInicio.visible = true;

	btnInicio.disabled=true;
	btnInicio.visible =false;

	state = Menu;
}



function Ayuda() {
	PantallaAyuda();
	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = true;
	EscenaDeJuego.visible = false;
	EscenaSobre.visible = false;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	mensajeDin.visible = false;
	//	EscenarioGral.visible = true;

	//	btnJugar.y = LINEA_BOTONES_OFF;
	//	btnAyuda.y = LINEA_BOTONES_OFF;		//	durante el juego mantenemos el boton de ayuda
	//	btnSobre.y = LINEA_BOTONES_OFF;
	//	btnVolver.y = LINEA_BOTONES;

	btnAyuda.disabled=true;
	btnAyuda.visible = false;

	btnJugar.disabled=true;
	btnJugar.visible = false;

	btnAcerca.disabled=true;
	btnAcerca.visible = false;

	btnInicio.visible = true;
	btnInicio.disabled=false;

	//	grupoSelector.visible = false;
	//	grupoSelector.disabled=true;

	//	btnInicio.disabled=false;
	//	btnInicio.visible =true;

	state = Ayuda;

}


// --------------------------
function HaceBotones() {
	var BtnTexture;

	// botones estandarizados. en el orden que se posicionan
	//	boton jugar
	btnJugar = generaBoton({texto:'Jugar'});
	btnJugar.x = 50;
	btnJugar.y = STAGE_Y - 100;
	app.stage.addChild(btnJugar);
	btnJugar.on('pointerdown', Jugar );	// Pointers normalize touch and mouse
	btnJugar.on('click',		 Jugar );			// mouse-only
	btnJugar.on('tap',		 Jugar );				// touch-only

	// boton inicio (abandona juego)
	btnInicio = generaBoton({texto:'Inicio'});
	btnInicio.x = 250;
	btnInicio.y = STAGE_Y - 100;
	app.stage.addChild(btnInicio);
	btnInicio.on('pointerdown', Menu );	// Pointers normalize touch and mouse
	btnInicio.on('click',		 Menu );			// mouse-only
	btnInicio.on('tap',		 Menu );				// touch-only

	//	acerca de
	btnAcerca = generaBoton({texto:'Info'});
	btnAcerca.x = 630;
	btnAcerca.y = STAGE_Y - 100;
	app.stage.addChild(btnAcerca);
	btnAcerca.on('pointerdown', Sobre );	// Pointers normalize touch and mouse
	btnAcerca.on('click',		 Sobre );			// mouse-only
	btnAcerca.on('tap',		 Sobre );				// touch-only

	//	Preparacion boton de ayudas
	btnAyuda = generaBoton({texto:'Ayuda'});
	btnAyuda.x = 420;
	btnAyuda.y = STAGE_Y - 100;
	app.stage.addChild(btnAyuda);
	btnAyuda.on('pointerdown', Ayuda );	// Pointers normalize touch and mouse
	btnAyuda.on('click',		 Ayuda );			// mouse-only
	btnAyuda.on('tap',		 Ayuda );				// touch-only

	grupoSelector = selectNroProbl();											//	lista para seleccionar nro de problema
	//	app.stage.addChild(grupoSelector);

}



//--------------------------------
function generaBoton( objBtn ){
/*
			x = 100,							// posicion del boton
			y = 100,
			bckColor= CLR_BOTONES,	//	backgorund color
			frgColor= CLR_TEXTO,	//	foreground color		
			width=120,						//	ancho del boton
			height=32,						//	alto del boton
			texto='boton'					//	texto del boton	
			}){

	generar un boton pasando un objeto con las propiedades del mismo
	una vez generado habra que indicarle posicion y funcionalidad

	https://www.javascripttutorial.net/es6/javascript-default-parameters/
		function fn(param1=default1,param2=default2,..) { }
	
	asignar valorpor defecto con typeof
	 b = typeof b !== 'undefined' ?  b : 1;

	// Logical Operator
	isHappyHour = isHappyHour ? isHappyHour : 'ðŸµ'; // 'ðŸº' 

*/

//	console.log( objBtn );
//b = typeof b !== 'undefined' ?  b : 1;
// isHappyHour = isHappyHour ? isHappyHour : 'Ã°Å¸ÂÂµ'; // 'Ã°Å¸ÂÂº'

// valores por defecto
objBtn.x				= objBtn.x				? objBtn.x				: 100;				// posicion del boton
objBtn.y				= objBtn.y				? objBtn.y				: 100;
objBtn.bckColor	= objBtn.bckColor	? objBtn.bckColor	: CLR_BOTONES;	//	backgorund color
objBtn.frgColor = objBtn.frgColor ? objBtn.frgColor : CLR_TXTBOT;	//	foreground color		
objBtn.width		= objBtn.width		? objBtn.width		: 120;				//	ancho del boton
objBtn.height		= objBtn.height		? objBtn.height		: 32;					//	alto del boton
objBtn.texto		= objBtn.texto		? objBtn.texto		: 'boton';		//	texto del boton	

//	console.log( objBtn );

	//	### para pruebas - boton dibujado
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	//	graphics.lineStyle(2, 0x332211, 0.95)
	graphics.beginFill( objBtn.bckColor, 0.9);
	graphics.drawRoundedRect(0,0, objBtn.width, objBtn.height,8);
	graphics.endFill();

const style = new PIXI.TextStyle({
    fontSize: 36,
    //	fontStyle: 'italic',
    fontWeight: 'bold',
    fill: 0xeeeeee,
    stroke: objBtn.frgColor,
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 0,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 2,
    wordWrap: true,
    wordWrapWidth: 440,
		fontFamily: "robotoregular",
		fontSize: "24px"
});

	//	const richText = new PIXI.Text('Rich text with a lot of options and across multiple lines', style);
	//	var btnText = new PIXI.Text(objBtn.texto, { fontFamily: "robotoregular",	fontSize: "24px", fill: objBtn.frgColor } );
	var btnText = new PIXI.Text(objBtn.texto, style );
	btnText.x = 0.5 * (objBtn.width -	btnText.width);
	btnText.y = 0;

	var elBoton = new Container();
	elBoton.addChild(graphics);
	elBoton.addChild(btnText);
	elBoton.interactive = true;	// Opt-in to interactivity
	elBoton.buttonMode = true;	// Shows hand cursor

	return elBoton;

}
//--------------------------------
	

function onDragStart(event)
{
	// store a reference to the data
	// the reason for this is because of multitouch
	// we want to track the movement of this particular touch
	this.data = event.data;
	this.alpha = 0.5;

 	//	this.dragging = true;

	//	var newPosition = this.data.getLocalPosition(this.parent);

	//	console.log('this.draggable: ' , this.draggable );
	//	console.log('this.enDestino: ' , this.enDestino );
	
	//	if (this.data)	{	}


	
	//	containsPoint (PIXI.AnimatedSprite)
	if (this.draggable)				//	si picamos en una pieza draggable
	{
		this.dragging = true;		
		//	y si la pieza ocupa un vertice, hay que desocupar el vertice
		//	console.log('this.destino, nPosition: ', this.destino, nPosition);
		if ( this.destino >= 0 )
		{
			aCasaDest[this.destino].digito = -1;		//	asignar valor a celda destino
		};

		this.destino = -1;
		//	}
	}

}


function onDragEnd()
{
	//	this serÃ­a el sprite con pieza-numero a posicionar
	let nPosition = 0;			//	posicion dedestino
	//	console.log('onDragEnd() --- this.dragging: ', this.dragging);
	//	console.log('this.position.x: ',this.position.x );
	//	console.log('this.position.y: ',this.position.y );

  if (this.dragging)
  {
		let lFound = false;			//	indica si solto pieza cerca de casilla disponible
		var newPosition = this.data.getLocalPosition(this.parent);
		//	verifico cercania a alguna celda destino
		console.log(newPosition);
		do
		{
			if ( !aCasaDest[nPosition].fijo )							//	no ir al digito fijo
			{
				//	console.log(Math.abs( CELDAS_START_X+ nPosition*(10+LADO) - newPosition.x ) < PRECISION &&					Math.abs( FILA_B - newPosition.y ) < PRECISION);
				console.log('aCasaDest[nPosition].digito: ', aCasaDest[nPosition].digito);
				lFound =
				( Math.abs( CELDAS_START_X+ nPosition*(10+LADO) - newPosition.x ) < PRECISION &&
					Math.abs( FILA_B - newPosition.y ) < PRECISION &&
					aCasaDest[nPosition].digito < 0 );				//	no ir posicion ocupada					
					//	console.log('nPosition, aCasaDest[nPosition].digito: ', nPosition, aCasaDest[nPosition].digito, ', lFound: ', lFound );
			}
			if ( !lFound ){nPosition++}
			//	console.log( 'nPosition: ', nPosition );
			//	if (nPosition > 10 ) { break;		}

		}
		while ( !lFound && (nPosition < NDIG) );

		if (lFound)
		{
			//	console.log(' asignar valores a aCasaDest[]', nPosition );
			//	alert(' asignar valores a aCasaDest[]' );
			newPosition.x = CELDAS_START_X+ nPosition*(10+LADO), 
			newPosition.y = FILA_B
			this.position.x = newPosition.x;
			this.position.y = newPosition.y;
			aCasaDest[nPosition].digito = this.digito;		//	asignar valor a celda destino
			this.destino = nPosition;
			console.log('this.destino, nPosition: ', this.destino, nPosition);

		} else {
			//	console.log('no se encopntrÃ³ casilla disponible','volver a casa');

			this.position.x = CELDAS_START_X +	this.digito*(10+LADO);
			this.position.y = FILA_C;

			//	console.log('			this.position.x: ', this.position.x);
			//	console.log('			this.position.y: ', this.position.y);
			
		}
	
	this.alpha = 1;
	this.dragging = false;
	// set the interaction data to null
	this.data = null;
	}
	//	por ahora: para ver que sale
	play();
	//	VerificaSuma();

}


function onDragMove()
{
	if (this.dragging)
	{
		var newPosition = this.data.getLocalPosition(this.parent);
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}


function GenJuego()	{					//	genera un nuevo juego
}


function leeJuegoSerie() {		// recupera datos de un juego de serie
	let
		numA = 0,
		numB = 0,
		numC = 0;		//	los numeros que operan: sumando 1, sumando2 y resultado

	cNumA = problemas[nroProbActual-1].cDigA;	//	cadena de digitos del primer sumando
	cNumB = problemas[nroProbActual-1].cDigB;	//	cadena de digitos del primer sumando
	
	if (DEBUG){
		console.log('--- inmediatemente despues de leer ---');
		console.log("cNumA: ", cNumA, cNumA.length );
		console.log("typeof cNumA: ", typeof cNumA );
		console.log("cNumB: ", cNumB);
	}
	//	calculo del numero valor A
	for (let i = 0; i < cNumA.length; i++) {
		numA += cNumA[i] * Math.pow(10, (9 - i));
	}
	if (DEBUG) { console.log( "\nnumA: ", numA )};
	//	calculo del valor numero B
	for (let i = 0; i < cNumB.length; i++) {
			numB += cNumB[i] * Math.pow(10, (9 - i));
	}
	numC = numA + numB;

	//	aqui tenemos calculados los tres numeros
	//	if (DEBUG) { console.log( "\nnumA: ", numA,"\nnumB: ", numB,"\nnumC: ", numC )};

	//	cNumA = ("0".repeat(10) + numA.toString()).substr(-10); //	cadena de digitos del numero A
	//	cNumB = ("0".repeat(10) + numB.toString()).substr(-10);
	cNumC = ("0".repeat(10) + numC.toString()).substr(-10);

	cLetrasB = "";
	cLetrasC = "";
	// comenzamos a colocar las letras
	// armar array de equivalencias
	for (let i = 0; i < cNumA.length; i++) {
		//	console.log(i, " cNumB[i]: ", cNumB[i], cLetrasA[cNumA.indexOf( cNumB[i] )] );
		cLetrasB += cLetrasA[cNumA.indexOf( cNumB[i] )];
		cLetrasC += cLetrasA[cNumA.indexOf( cNumC[i] )];

//			if (DEBUG){
//				console.log("cLetrasA[cNumA.indexOf( cNumB[i])]: ", cLetrasA[cNumA.indexOf( cNumB[i])]	);
//				console.log("cNumA.indexOf( cNumB[i])			: ", cNumA.indexOf( cNumB[i])						);
//				console.log("cNumB[i]						: ", cNumB[i]														);
//				//	console.log("cLetrasA[cNumA.indexOf( cNumC[i]", cLetrasA[cNumA.indexOf( cNumC[i])]);
//			}
	}

	if (DEBUG){
		console.log("cNumA: ", cNumA);
		console.log("cNumB: ", cNumB);
		console.log("cNumC: ", cNumC);
		//	console.log("cLetrasA: ", cLetrasA);
		console.log("cLetrasB: ", cLetrasB);
		//	console.log("cLetrasC: ", cLetrasC);
	}

}




function end() {

	//	detectar y procesar teclas pulsadas mediante 'keydown' event listener en el document
	document.addEventListener('keydown', onKeyDown);

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;		//	container ayudas
	EscenaDeJuego.visible = true;
	EscenaSobre.visible = false;		//	container estadisticas
	EscenaFinJuego.visible = true;		//	container aviso de fin del juego
	EscenaMenuInic.visible = false;		//	container pantalla de inicio
	app.stage.visible = true;		//	container del juego

	EscenaDeJuego.alpha = 0.8 ;


	// let's create a moving shape - intentar mas adelante
	const roundRect = new PIXI.Graphics();
	//	roundRect.lineStyle(4, 0x332211, 0.95)
	roundRect.beginFill( FONDO_AYUDA, 0.9);	
	roundRect.drawRoundedRect(100, 40, 650, 400, 20 );
	roundRect.endFill();

	MessageFin = new PIXI.Text( "Solución correcta.\nFelicitaciones!", 
		//	{ fontFamily: FONT_NIVEL2,	fontSize: "64px", fill: CLR_TEXTO });	
		{ fontFamily: FONT_NIVEL2,	fontSize: "64px", fill: 0x882211 });	
		MessageFin.x = 150;
		MessageFin.y = 150;
	mensajeDin = new Container();
	mensajeDin.addChild(roundRect);
	mensajeDin.addChild(MessageFin);
	app.stage.addChild(mensajeDin);

	mensajeDin.visible = true;

//		let count = 0;
//		do	{ 
//			console.log( mensajeDin.width);
//			count += 0.01;
//			mensajeDin.scale.set( count * 0.1)
//	
//			setTimeout( function() {	
//				app.renderer.render(EscenaFinJuego);
//				app.renderer.render(app.stage);
//			}, 500 )
//		}
//		while ( mensajeDin.width < 600 );

//		app.ticker.add(() => {
//			count += 0.1;
//			if (mensajeDin.width < 500 ) {
//				mensajeDin.scale.set( count * 0.1);
//			} else {
//				console.log( '--- ticker deberia estar deteniendose ---')
//				app.ticker.stop() 
//			}
//			console.log( mensajeDin.width)
//		});

	//	btnJugar.y = LINEA_btnES_OFF ;
	//	btnAyuda.y = LINEA_BOTONES_OFF ;		//	durante el juego mantenemos el boton de ayuda
	//	btnSobre.y = LINEA_BOTONES_OFF ;
	//	btnVolver.y = LINEA_BOTONES;
	//	btnInicio.y = LINEA_BOTONES;

	btnJugar.visible = true;
	btnAyuda.visible = true;
	btnAcerca.visible = true;
	//	btnVolver.visible = false;
	btnInicio.visible =true;

	//	Jugar();
	
}



//	procesar teclas pulsadas
function onKeyDown(key) {

	var	cualTecla = key.key;
    if (key.key === "*" ) {
		state = Menu;
    }
    // W Key is 87
    // Up arrow is 38
    if (key.keyCode === 87 || key.keyCode === 38) {
    }
    // S Key is 83
    // Down arrow is 40
    if (key.keyCode === 83 || key.keyCode === 40) {
    }
    // A Key is 65
    // Left arrow is 37
    if (key.keyCode === 65 || key.keyCode === 37) {
    }
    // D Key is 68
    // Right arrow is 39
    if (key.keyCode === 68 || key.keyCode === 39) {
    }

}


function PantallaSobre() {
	var graphics = new PIXI.Graphics();
	// draw a rounded rectangle
	graphics.lineStyle(4, 0x332211, 0.95)
	graphics.beginFill( FONDO_AYUDA, 0.95);
	graphics.drawRoundedRect(40, 40, STAGE_X-240, 400 );
	graphics.endFill();

	EscenaSobre.addChild(graphics);

	const style = {
		fontStyle: 'italic',
		//	fontWeight: 'light',
		stroke: '#4a1850',
		strokeThickness: 1,
		dropShadow: false,
		wordWrap: true,
		wordWrapWidth: 700,
		fontFamily: FONT_NIVEL3,	
		fontSize: 28, 
		fill: CLR_TEXTO
	};
	var richText = new PIXI.Text('SUMA OCULTA version ' + VERSION + '\n\n' +
		'Un juego desafio desarrollado por \n' +
		'Willie Verger Juegos de Ingenio\n\n' +
		'Soporte: info@ingverger.com.ar\n' +
		'Web: ingverger.com.ar\n' +
		'\n', style );
		//	{ fontFamily: FONT_NIVEL3,	fontSize: "32px", fill: CLR_TEXTO } );


	richText.x = 60;
	richText.y = 60;
	EscenaSobre.addChild(richText);

	EscenaSobre.visible = true;

	btnAcerca.disabled = true;
	btnAcerca.visible  = false;
	btnAyuda.disabled  = true;
	btnAyuda.visible   = false;
	btnInicio.disabled = false;
	btnInicio.visible  = true;
	btnJugar.disabled  = true;
	btnJugar.visible   = false;

	mensajeDin.visible = false;

}

function Sobre() {

	PantallaSobre();

	//	definir cuales son las escenas visibles y cuales invisibles
	EscenaDeAyudas.visible = false;
	EscenaDeJuego.visible = false;
	EscenaSobre.visible = true;
	EscenaFinJuego.visible = false;
	EscenaMenuInic.visible = false;
	app.stage.visible = true;

	btnInicio.disabled=false;
	btnInicio.visible =true;

	state = Sobre;

}


function resize() {
  // Determine which screen dimension is most constrained
  ratio = Math.min(window.innerWidth/STAGE_X, window.innerHeight/STAGE_Y);
	//		ratio = 0.7;
	
	//	para que la escena quede centrada en el ancho
	app.view.style.left = (window.innerWidth	- STAGE_X * ratio ) / 2 + "px";

	console.log('ratio: ' + ratio +
	//	'\nmostrarPropiedades(app.screen, "app.screen")' + mostrarPropiedades(app.screen, "app.screen") +
	'\nSTAGE_X: ' + STAGE_X +
	'\nSTAGE_Y: ' + STAGE_Y +
	'\nwindow.innerWidth: ' + window.innerWidth +
	'\nwindow.innerHeight: ' + window.innerHeight +
	'\nMath.ceil(STAGE_X * ratio): ' + Math.ceil(STAGE_X * ratio) +
	'\napp.view.style.left: ' + app.view.style.left
		);	

	// Scale the view appropriately to fill that dimension
  app.stage.scale.x = app.stage.scale.y = ratio;

	// Update the renderer dimensions
	// adecuacion a pixi 5.
  //	app.resize(Math.ceil(STAGE_X * ratio), Math.ceil(STAGE_Y * ratio));
  app.resize(Math.floor(STAGE_X * ratio), Math.floor(STAGE_Y * ratio));

	//	app.resizeTo = true;


}



function VerificaSuma() {
	var	lResult = true;
	//	console.log('verificando suma: ' );
	for (var i=0; i< NDIG ; i++)
	{
		lResult = lResult && aCasaDest[i].digito == cNumA[i];
		//	console.log( i, ' aCasaDest[i].digito: ', aCasaDest[i].digito, '== cNumA[i]: ', cNumA[i] );
	}
	//	console.log( 'lResult: ', lResult);
	return lResult;
}



function errorSuma() {
	var	lResult = true;
	//	si completo casilleros pero no daba suma avisamos error
	var cTxt = 'aCasaDest digitos: ';

	for (var i=0; i< NDIG ; i++)	{
		lResult = lResult && aCasaDest[i].digito >= 0;			//	= '';
		cTxt += aCasaDest[i].digito + ',';	//	, '== cNumA[i]: ', cNumA[i] );
	}
	//	console.log( i, ' aCasaDest[i].digito: ', aCasaDest[i].digito);	//	, '== cNumA[i]: ', cNumA[i] );
	console.log( cTxt);
	return lResult;
}




function selectNroProbl(){
	const
		anchoCaja = 400,
		altoCaja = 150,
		x0 = 350,
		y0 = 400,
		COLOR_CAJA = 0x669900;				//	0x9966ff,				//	0x99bbff,
		//	COLOR_FLECHA = 0x990033;

	let 
		BotonDificilMas = undefined,
		BotonDificilMenos = undefined,
		btnNroMasMas,
		btnNroMenosMenos,
		selecProb = new Container();
	
	//	Texto grande; numeros indicadores del nivel actual
	var style_L = new PIXI.TextStyle({
		fill: CLR_TXTBOT,					    //	
		fontFamily: FONT_NIVEL2,			//	fontFamily: 'Titan One',			//	cursive;
		fontSize: 64,
		fontWeight: "bold",
		padding: 12,
	});

	//	Texto mediano; incrementadores
	var style_M = new PIXI.TextStyle({
		fill: CLR_TXTBOT,					    //	
		fontFamily: FONT_NIVEL2,			//	fontFamily: 'Titan One',			//	cursive;
		fontSize: 44,
		fontWeight: "bold",
		padding: 12,
	});

	//	---------------------------------------------------------------
	//	Texto pequeño; Titulo del selector, texto de la caja e indicador de nivel
	let style_S = new PIXI.TextStyle({
		fill: CLR_TXTBOT,					    //	
		fontFamily: FONT_NIVEL2,			//	fontFamily: 'Titan One',			//	cursive;
		fontSize: 24,
		fontWeight: "normal",
		padding: 4,
	});

	// draw a rounded rectangle
	var graphics = new PIXI.Graphics();
	graphics.beginFill(COLOR_CAJA, 0.99);
	graphics.drawRoundedRect(x0, y0, anchoCaja, altoCaja, 10);
	graphics.endFill();
	selecProb.addChild(graphics);


	//	--------------------------------------------------------
	//	a titulo experimental pruebo botones con simbolos mas y menos
	//	boton menos menos
	//	doble triang izq: String.fromCharCode(9194)
	btnNroMenosMenos = new PIXI.Text( String.fromCharCode(9664)+String.fromCharCode(9664), style_M );
	btnNroMenosMenos.x = x0 + (0.1 * anchoCaja);
	btnNroMenosMenos.y = y0 + (0.65 * altoCaja);
	btnNroMenosMenos.anchor.set(0.5);
	btnNroMenosMenos.interactive = true;				
	btnNroMenosMenos.buttonMode = true;			// Shows hand cursor
	btnNroMenosMenos.on('pointerdown', MenosDiez );

	//	boton decrementa dificultad
	BotonDificilMenos = new PIXI.Text( String.fromCharCode(9664), style_M );
	BotonDificilMenos.x = x0 + (0.3 * anchoCaja);
	BotonDificilMenos.y = y0 + (0.65 * altoCaja);
	BotonDificilMenos.anchor.set(0.5);
	BotonDificilMenos.interactive = true;				
	BotonDificilMenos.buttonMode = true;			// Shows hand cursor
	BotonDificilMenos.on('pointerdown', MenosDificil );

	//	boton incrementa dificultad
	BotonDificilMas = new PIXI.Text( String.fromCharCode(9654), style_M );
	BotonDificilMas.x = x0 + (0.7 * anchoCaja);
	BotonDificilMas.y = y0 + (0.65 * altoCaja);
	BotonDificilMas.anchor.set(0.5);
	BotonDificilMas.interactive = true;				
	BotonDificilMas.buttonMode = true;			// Shows hand cursor
	BotonDificilMas.on('pointerdown', MasDificil );

	//	boton incrementa dificultad
	//	doble triang der: String.fromCharCode(9193)
	btnNroMasMas = new PIXI.Text( String.fromCharCode(9654)+String.fromCharCode(9654), style_M );
	btnNroMasMas.x = x0 + (0.9 * anchoCaja);
	btnNroMasMas.y = y0 + (0.65 * altoCaja);
	btnNroMasMas.anchor.set(0.5);
	btnNroMasMas.interactive = true;				
	btnNroMasMas.buttonMode = true;			// Shows hand cursor
	btnNroMasMas.on('pointerdown', MasDiez );

	//	selecProb.addChild(BotonDificilMas);
	//	selecProb.addChild(BotonDificilMenos);
	//	selecProb.addChild(btnNroMasMas);
	//	selecProb.addChild(btnNroMenosMenos);
	selecProb.addChild(BotonDificilMas, BotonDificilMenos, btnNroMasMas, btnNroMenosMenos);

	//	numero indicador de nivel de dificultad
	//	la variable debe definirse entre las globales para ser luego actualizada 
	//	mediante los botones que tambien deben ser reconocidos global
	imgNroProb = new PIXI.Text( "8", style_L );
	imgNroProb.x = x0+(anchoCaja/2);
	imgNroProb.y = y0 + (0.65 * altoCaja);
	imgNroProb.anchor.set(0.5);

	var txtTitulo = new PIXI.Text( 'Selección Problema', style_S );
	txtTitulo.x = x0+(anchoCaja/2);
	txtTitulo.y = y0 + 36 ;
	txtTitulo.anchor.set(0.5);

	selecProb.addChild(imgNroProb);
	selecProb.addChild(txtTitulo);

	return selecProb;
	
}

function MasDificil() {
	if (nroProbActual < CANTPROBLEMAS ) { nroProbActual++ }
	imgNroProb.text = nroProbActual;
	if (DEBUG)	{		console.log("nroProbActual: " + nroProbActual );	}
	setStorage("nroProblemaStored", nroProbActual);
}

function MenosDificil() {
	if (nroProbActual > 1 ) { nroProbActual-- }
	imgNroProb.text = nroProbActual;
	if (DEBUG)	{ console.log("nroProbActual: " + nroProbActual); }
	setStorage("nroProblemaStored", nroProbActual);
}

function MasDiez() {
	nroProbActual = 10 + 1 * nroProbActual ;
	if (nroProbActual > CANTPROBLEMAS ) { 
		console.log("nroProbActual: " + nroProbActual );	
		nroProbActual = CANTPROBLEMAS 
	}
	imgNroProb.text = nroProbActual;
	setStorage("nroProblemaStored", nroProbActual);
}

function MenosDiez() {
	nroProbActual -= 10; 
	if (nroProbActual < 1 ) { nroProbActual = 1 }
	imgNroProb.text = nroProbActual;
	if (DEBUG)	{ console.log("nroProbActual: " + nroProbActual); }
	setStorage("nroProblemaStored", nroProbActual);
}








//----------------------------------
// save nro problema to localstorage (creo que no se va a usar)
//----------------------------------
function setNroProbl(n) {
//	var n = nroProblema.value;

	if (DEBUG)	{	console.log('en setNroProbl()\nnro de problema antes: ' + nroProbActual + ', ' + n );	}
	nroProbActual = n;			//	parseInt( nroProblema.value);	
	setStorage("nroProblemaStored", nroProbActual);
	if (DEBUG)	{	console.log('nro de problema fijado: ' + nroProbActual);	}
}

//-------------------------------------------
// get nro problema from localstorage
//-------------------------------------------
function getNroProbl()
{
	let nCual = getStorage("nroProblemaStored");

	if(isNaN(nCual) || nCual < 1 || nCual > CANTPROBLEMAS )
	{
		nCual = 1;
	}

	if (DEBUG) { 	console.log('nCual: ' + nCual ); 	};

	return nCual

	
}


// rutinas de uso comun
//=======================================
// BEGIN for set|get|clear localstorage
//=======================================
function setStorage(key, value)
{
	if(typeof(window.localStorage) != 'undefined'){
		window.localStorage.setItem(key,value);
	}
}

function getStorage(key)
{
	var value = null;
	if(typeof(window.localStorage) != 'undefined'){
		value = window.localStorage.getItem(key);
	}
	return value;
}

function clearStorage(key)
{
	if(typeof(window.localStorage) != 'undefined'){
		window.localStorage.removeItem(key);
	}
}


	//-------------------------------------------------
	//	funciones exclusivas para depuracion
	//-------------------------------------------------
	function mostrarPropiedades(objeto, nombreObjeto) {
		//	https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Trabajando_con_objectos

		var resultado = "";
		for (var i in objeto) {
			//	if (objeto.hasOwnProperty(i)) {
				resultado += nombreObjeto + "." + i + " = " + objeto[i] + "\n";
			//	}
		}
		return resultado;
	}



/*
Descripcion de funciones en col 31

( 163,1):function setup() {
( 250,1):function PantallaInicio() {
( 288,1):function HaceMensajeFin() {		//	prepara mensaje para solucion correcta
( 310,1):function gameLoop() {
( 330,1):function play() {
( 347,1):function PantallaAyuda() {			//	prepara pantalla de ayudas
( 402,1):function PantallaJugar() {
( 536,1):function Jugar() {
( 578,1):function Menu() {
( 601,1):function Ayuda() {
( 639,1):function HaceBotones() {
( 682,1):function generaBoton( objBtn ){
( 766,1):function onDragStart(event)
( 801,1):function onDragEnd()
( 868,1):function onDragMove()
( 882,1):function GenJuego()	{					//	genera un nuevo juego
( 886,1):function leeJuegoSerie() {			// recupera datos de un juego de serie
( 943,1):function end() {
(1011,1):function onKeyDown(key) {
(1037,1):function PantallaSobre() {
(1073,1):function Sobre() {
(1093,1):function resize() {
(1108,1):function VerificaSuma() {


*/

