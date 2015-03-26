var isOldColorInitialized = false;

var currentColorHSL = [0, 50, 50];
var currentColorRGB = [0, 0, 0];

var isMyself = true;
var __t = false;

var oldColorHSL = [0, 50, 50];
var oldColorRGB = [0, 0, 0];

var PS_UPDATE_NO = 0;
var PS_UPDATE_DELAY = 1;
var PS_UPDATE_FORCE = 2;

var isDragging;

var clientXBeforeDrag;
var clientYBeforeDrag;

var colorHSLBeforeDrag;

var isInPhotoshop = (typeof window.__adobe_cep__ != "undefined");

var lastFocus = new Date().getTime();

//##bidouille : on recoit a nouveau un evt quand on change la layer d'ajustement
var lastPSColorUpdate = 0;

// init ---------------------------------------------------------------------------

function init() {
	//photoshop
	//initColor() est fait separement (sur le onLoad())
	//car il faut attendre que les jsx soient charges
	if(isInPhotoshop) {
		setPersistent();
		registerPSEvent();
		registerCustomEvents();
		createFlyoutMenu();
	}
		
	//ui
	tInstall();
	createMarker();
	createHueMarker();
	createUpDownButtons();
	resizeDisplay();
	
	//events
	$(window).mousedown(function(event) {
		windowMouseDown(event);
	});
	$(window).mousemove(function(event) {
		windowMouseMove(event);
	});
	$(window).mouseup(function(event) {
		windowMouseUp(event);
	});
	$("#color_swatch_old").click(function() {
		revertColor();
	});
	$("#color_swatch_new").click(function() {
		commitColor();
	});
	$("#H_up").click(function(event) {
		event.preventDefault();
		incrementHSL(0, 1, true);
	});
	$("#H_down").click(function(event) {
		incrementHSL(0, -1, true);
	});
	$("#S_up").click(function(event) {
		incrementHSL(1, 1, true);
	});
	$("#S_down").click(function(event) {
		incrementHSL(1, -1, true);
	});
	$("#L_up").click(function(event) {
		incrementHSL(2, 1, true);
	});
	$("#L_down").click(function(event) {
		incrementHSL(2, -1, true);
	});
}

function incrementHSL(index, increment, forceUpdate) {
//	console.log("incrementing HSL : " + index + ", " + increment);
	currentColorHSL[index] = currentColorHSL[index] + increment;
	if(increment == -1 && currentColorHSL[index] < 0) {
		if(index > 0)
			currentColorHSL[index] = 0;
		else
			currentColorHSL[index] += 360;
		
	}
	if(increment == 1) {
		if(index == 0 && currentColorHSL[index] > 360)
			currentColorHSL[index] -= 360;
		if(index > 0 && currentColorHSL[index] > 100)
			currentColorHSL[index] = 100;
		
	}
	updateDisplay(forceUpdate ? PS_UPDATE_FORCE : PS_UPDATE_DELAY);
}

function tInstall() {
	if(!__t)
		$("#_t_div").css("visibility","hidden");
}

function tClick() {
	$("#_t_div").css("visibility","hidden");
}

function createMarker() {
	var c=document.getElementById("marker");
	c.width = 9;
	c.height = 9;
	var ctx=c.getContext("2d");
	ctx.lineWidth="1";
	ctx.beginPath();
	ctx.strokeStyle="rgba(0,0,0,255)";
	ctx.rect(0.5,0.5,8,8);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="rgba(255,255,255,255)";
	ctx.lineWidth="1";
	ctx.rect(1.5,1.5,6,6);
	ctx.stroke();
}

function createHueMarker() {
	var c=document.getElementById("hue_marker");
	c.width = 24;
	c.height = 9;
	var ctx=c.getContext("2d");
	ctx.lineWidth="1";
	ctx.beginPath();
	ctx.strokeStyle="rgba(0,0,0,255)";
	ctx.rect(0.5,0.5,23,8);
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle="rgba(255,255,255,255)";
	ctx.lineWidth="1";
	ctx.rect(1.5,1.5,21,6);
	ctx.stroke();}

function createUpDownButtons() {
	var HSL = ["H","S","L"];
	for(var j=0; j<=1; j++) {
		for(var i=0; i<3; i++) {
			var suffix = (j == 0 ? "_up" : "_down");  
			var c=document.getElementById(HSL[i]+suffix);
			c.width = 15;
			c.height = 11;
			var ctx=c.getContext("2d");
			ctx.fillStyle = "rgba(0,0,0,100)";
			ctx.beginPath();
			if(j==0) {
				ctx.moveTo(3.5, 8);
				ctx.lineTo(11.5,8);
				ctx.lineTo(7.5, 4);
				ctx.lineTo(3.5, 8);
			} else {
				ctx.moveTo(3.5, 3);
				ctx.lineTo(11.5,3);
				ctx.lineTo(7.5, 7);
				ctx.lineTo(3.5, 3);
			}
			ctx.closePath();
			ctx.fill();
		}
	}
}

var draggableComponents = ["canvas1", "hue_slider"];
var draggableSpinners = ["H_spinner", "S_spinner", "L_spinner"];

function draggableType(targetId) {
	for(var i=0; i<draggableComponents.length; i++) {
		if(targetId == draggableComponents[i])
			return 1;
	}
	for(var i=0; i<draggableSpinners.length; i++) {
		if(targetId == draggableSpinners[i])
			return 2;
	}
	return 0;
}

function windowMouseDown(e) {
	var targetId = e.target.id;
	var draggable = draggableType(targetId);
	if(draggable > 0) {
		isDragging = targetId;
		e.preventDefault();
	}
	if(draggable == 1) {
		moveTo(targetId, e.clientX, e.clientY);
	} else if(draggable == 2) {
		clientXBeforeDrag = e.clientX;
		clientYBeforeDrag = e.clientY;
		colorHSLBeforeDrag = currentColorHSL.slice();
	}
}

function windowMouseUp(event) {
	if(typeof isDragging !== "undefined")
		updateDisplay(PS_UPDATE_FORCE);
	isDragging = undefined;
	if(isMyself && document.hasFocus())
		loseFocus();
}

function windowMouseMove(e) {
	if(typeof isDragging  !== "undefined") {
		var draggable = draggableType(isDragging);
		if(draggable == 1) {
			moveTo(isDragging, e.clientX, e.clientY);
		} else if(draggable == 2) {
			dragSpinner(isDragging, e.clientX, e.clientY);
		}		
	}
	if(isMyself && document.hasFocus())
		loseFocus();
}

function dragSpinner(targetId, clientX, clientY) {
	var i, maxValue;
	if(targetId == "H_spinner") { i = 0; maxValue = 360.0; }
	else if(targetId == "S_spinner") { i = 1; maxValue = 100.0 }
	else if(targetId == "L_spinner") { i = 2; maxValue = 100.0 }
	currentColorHSL[i] = colorHSLBeforeDrag[i] - maxValue * (clientY - clientYBeforeDrag) / $("#canvas1").height();
	if(i == 0) {
		currentColorHSL[0] = currentColorHSL[0] % 360.0;
		if(currentColorHSL[0] < 0)
			currentColorHSL[0] += 360;
	} else {
		if(currentColorHSL[i] < 0)
			currentColorHSL[i] = 0;
		if(currentColorHSL[i] > 100.0)
			currentColorHSL[i] = 100.0;
	} 
	updateDisplay(PS_UPDATE_DELAY);
}

function moveTo(targetId, clientX, clientY) {
	var target = $("#"+targetId);
	var pos=target.position();
	var relativeX = clientX - pos.left;
	var relativeY = clientY - pos.top;
	if(targetId == "canvas1") {
		if(relativeX < 0) relativeX = 0;
		if(relativeX >= target.width()) relativeX = target.width() - 1;
		if(relativeY < 0) relativeY = 0;
		if(relativeY >= target.height()) relativeY = target.height() - 1;
		moveMarker(relativeX, relativeY);
	} else if(targetId == "hue_slider") {
		moveHueMarker(relativeX, relativeY);
	}
}

//relativeX, relativeY : les coordonnees du futur *centre* du marker
function moveMarker(relativeX, relativeY) {
	currentColorHSL[1] = posToValue($("#canvas1").width(), 100.0, relativeX, undefined);
	currentColorHSL[2] = posToValue($("#canvas1").height(), 100.0, relativeY, true);
	updateDisplay(PS_UPDATE_DELAY);
}

function moveHueMarker(relativeX, relativeY) {
	var hue = posToValue($("#hue_slider").height(), 360.0, relativeY, true) % 360;
	if(hue < 0)
		hue += 360;
	currentColorHSL[0] = hue;
	updateDisplay(PS_UPDATE_DELAY);
}

// affichage -------------------------------------------------

function resizeDisplay() {
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var canvas1Height = windowHeight - 5*3 - 57;
	$("#canvas1").width(windowWidth - 5*3 - 20);
	$("#canvas1").height(canvas1Height);
	$("#hue_slider").height(canvas1Height);
	$("#_t_div").width(windowWidth);
	$("#_t_div").height(windowHeight);
	updateDisplay(PS_UPDATE_NO);
}

function updateDisplay(forcePSUpdate) {
	updateHueSlider();
	updateHueMarkerPosition();

	//doit etre avant updateMarkerPosition car updateMarkerPosition utilise les valeurs de canvas1 
	updateCanvas1();
	//doit etre avant la mise a jour des spinners et de la couleur car c'est la qu'on sette les valeurs (R,G,B)
	updateMarkerPosition();
	
	updateNewColorSwatch();
	updateOldColorSwatch();

	updateSpinners();
	
	//updateFocusState();
	
	updatePSFgColor(forcePSUpdate);
}

function valueToPos(maxPos, maxValue, value, reverse) {
	if(typeof reverse === "undefined")
		reverse = false;
	var relativeValue = value / maxValue;
	if(reverse)
		relativeValue = 1 - relativeValue;
	var result = Math.round(relativeValue * (maxPos - 1));
	return result;
}

function posToValue(maxPos, maxValue, pos, reverse) {
	if(typeof reverse === "undefined")
		reverse = false;
	var relativePos = pos / (maxPos - 1);
	if(reverse)
		relativePos = 1 - relativePos;
	return relativePos * maxValue;
}

function updateNewColorSwatch() {
	var backGroundColorValue = ("rgba(" + Math.round(currentColorRGB[0]) + "," + Math.round(currentColorRGB[1]) + "," + Math.round(currentColorRGB[2]) + ",255)");
	$("#color_swatch_new").css({
		backgroundColor: backGroundColorValue
	});
}

function updateOldColorSwatch() {
	var backGroundColorValue = ("rgba(" + Math.round(oldColorRGB[0]) + "," + Math.round(oldColorRGB[1]) + "," + Math.round(oldColorRGB[2]) + ",255)");
	$("#color_swatch_old").css({
		backgroundColor: backGroundColorValue
	});
}

function updateSpinners() {
	$("#H_spinner").text("H:" + Math.round(currentColorHSL[0]));
	$("#S_spinner").html("S:" + Math.round(currentColorHSL[1]));
	$("#L_spinner").html("L:" + Math.round(currentColorHSL[2]));
	$("#R_spinner").html("R:" + currentColorRGB[0]);
	$("#G_spinner").html("G:" + currentColorRGB[1]);
	$("#B_spinner").html("B:" + currentColorRGB[2]);
}

function updateFocusState() {
	var backGroundColorValue = document.hasFocus() ? "white" : "black";
	$("#focus_state").css({
		backgroundColor: backGroundColorValue
	});
}

function updateMarkerPosition() {
	var pos = $("#canvas1").position();
	var markerXPos=valueToPos($("#canvas1").width(), 100.0, currentColorHSL[1], undefined);
	var markerYPos=valueToPos($("#canvas1").height(), 100.0, currentColorHSL[2], true);
	var x = pos.left + markerXPos - 4;
	var y = pos.top + markerYPos - 4;
	$("#marker").css({
		position: "fixed",
	    left: (x + "px"),
	    top: (y + "px")
	});
	var element = document.getElementById("canvas1");
	var context2d = element.getContext("2d");
	var canvas1 = document.getElementById("canvas1");
	var markerXCanvasPos = valueToPos(canvas1.width, 100.0, currentColorHSL[1], undefined);
	var markerYCanvasPos = valueToPos(canvas1.height, 100.0, currentColorHSL[2], true);
	var p = context2d.getImageData(markerXCanvasPos,markerYCanvasPos,1,1).data;
	currentColorRGB = [p[0],p[1],p[2]];
}

function updateHueMarkerPosition() {
	var pos = $("#hue_slider").position();
	var x = pos.left - 2;
	var y = pos.top + valueToPos($("#hue_slider").height(), 360.0, currentColorHSL[0], true) - 4;
	$("#hue_marker").css({
		position: "fixed",
	    left: (x + "px"),
	    top: (y + "px")
	});
}

function updateHueSlider() {
	var element = document.getElementById("hue_slider");
	element.width = 1;
	element.height = 360;

	var context2d = element.getContext("2d");
	
	// read the width and height of the canvas
 	var width = element.width;
 	var height = element.height;

 	var imageData;
 	
	imageData = context2d.createImageData(width, height);

	for(var j=0; j< height; j++) {
		var hRad = posToValue(height, Math.PI * 2, j, true);
		var cosH = Math.cos(hRad);
		var sinH = Math.sin(hRad);
		var R,G,B,L;
		for(L = 100; L > 0; L--) {
			var rgb = LCHToRGB(L, cosH, sinH, 100);
			R = Math.round(rgb[0] * 255);
			G = Math.round(rgb[1] * 255);
			B = Math.round(rgb[2] * 255);
			if(R<=255 && G<=255 &&B<=255)
				break;
		}
		for(var i=0; i<width; i++) {
			updateImageData(imageData, width, i, j, R, G, B);
		}
	}
	
	// copy the image data back onto the canvas
	context2d.putImageData(imageData, 0, 0); // at coords 0,0
}

//mise a jour canvas1 ----------------------------------------------------------

function updateCanvas1() {
	var H = currentColorHSL[0];
	var element = document.getElementById("canvas1");
	element.width = 100;
	element.height = 100;
	var context2d = element.getContext("2d");
	
	// read the width and height of the canvas
 	var width = element.width;
 	var height = element.height;

	var imageData = context2d.createImageData(width, height);

	var hRad = H * Math.PI / 180;
	var cosH = Math.cos(hRad);
	var sinH = Math.sin(hRad);

	var lastR;
	var lastG;
	var lastB;

	for(var j = 0; j < height; j++) {
		var L = posToValue(height, 100.0, j, true); 
		for(var i = 0; i < width; i++) {
			var t = posToValue(width, 100.0, i, undefined);
			var a, b;
			
			var rgb = LCHToRGB(L, cosH, sinH, t);
			
			var R = Math.round(rgb[0] * 255);
			var G = Math.round(rgb[1] * 255);
			var B = Math.round(rgb[2] * 255);
			
			if(R>255 || G > 255 || B > 255 || R < 0 || G < 0 || B < 0) {
				R = lastR;
				G = lastG;
				B = lastB;
			} else {
				lastR = R;
				lastG = G;
				lastB = B;
			}
				
			updateImageData(imageData, width, i, j, R, G, B);
		}
	}

	// copy the image data back onto the canvas
	context2d.putImageData(imageData, 0, 0); // at coords 0,0
	
}

function updateImageData(imageData, width, i, j, r, g, b) {
	var pos = 4 * (j * width + i);
	imageData.data[pos++] = r;
	imageData.data[pos++] = g;
	imageData.data[pos++] = b;
	imageData.data[pos] = 255; // opaque alpha
}

//conversions couleur

function LCHToRGB(L, cosH, sinH, t) {
	var a, b;
	if(Math.abs(cosH) > Math.abs(sinH)) {
		a = cosH > 0 ? t : -t;
		b = a * sinH / cosH;
	} else {
		b = sinH > 0 ? t : -t;
		a = b * cosH / sinH;
	}
	
	//conversion vers XYZ
	var y = (L + 16 ) / 116;
	var x = a / 500 + y;
	var z = y - b / 200;
	if ( Math.pow(y,3) > 0.008856 ) y = Math.pow(y,3); else y = (y - 16 / 116 ) / 7.787;
	if ( Math.pow(x,3) > 0.008856 ) x = Math.pow(x,3); else x = (x - 16 / 116 ) / 7.787;
	if ( Math.pow(z,3) > 0.008856 ) z = Math.pow(z,3); else z = (z - 16 / 116 ) / 7.787
	var X = 95.047 * x;    //ref_X =  95.047     Observer= 2°, Illuminant= D65
	var Y = 100.0 * y;     //ref_Y = 100.000
	var Z = 108.883 * z;   //ref_Z = 108.883
	
	//conversion vers RGB
	var var_X = X / 100        //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
	var var_Y = Y / 100        //Y from 0 to 100.000
	var var_Z = Z / 100        //Z from 0 to 108.883
	var var_R = var_X *  3.2406 + var_Y * -1.5372 + var_Z * -0.4986
	var var_G = var_X * -0.9689 + var_Y *  1.8758 + var_Z *  0.0415
	var var_B = var_X *  0.0557 + var_Y * -0.2040 + var_Z *  1.0570
	if ( var_R > 0.0031308 ) var_R = 1.055 * ( Math.pow(var_R,(1/2.4))) - 0.055;
	else                     var_R = 12.92 * var_R;
	if ( var_G > 0.0031308 ) var_G = 1.055 * ( Math.pow(var_G,(1/2.4))) - 0.055;
	else                     var_G = 12.92 * var_G;
	if ( var_B > 0.0031308 ) var_B = 1.055 * ( Math.pow(var_B,(1/2.4))) - 0.055;
	else                     var_B = 12.92 * var_B;
	return [var_R,var_G,var_B];
}

// "metier" -------------------------------------------------------------------

function rGBToHSL(RGB) {
	//RBG to XYZ
	var var_R = ( RGB[0] / 255 )        //R from 0 to 255
	var var_G = ( RGB[1] / 255 )        //G from 0 to 255
	var var_B = ( RGB[2] / 255 )        //B from 0 to 255

	if ( var_R > 0.04045 ) var_R = Math.pow( ( var_R + 0.055 ) / 1.055 , 2.4);
	else                   var_R = var_R / 12.92;
	if ( var_G > 0.04045 ) var_G = Math.pow( ( var_G + 0.055 ) / 1.055 , 2.4);
	else                   var_G = var_G / 12.92;
	if ( var_B > 0.04045 ) var_B = Math.pow( ( var_B + 0.055 ) / 1.055 , 2.4);
	else                   var_B = var_B / 12.92;

	var_R = var_R * 100;
	var_G = var_G * 100;
	var_B = var_B * 100;

	//Observer. = 2°, Illuminant = D65
	var X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
	var Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
	var Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
	
	//XYZ to Lab
	var var_X = X / 95.047;           //ref_X =  95.047   Observer= 2°, Illuminant= D65
	var var_Y = Y / 100.000;          //ref_Y = 100.000
	var var_Z = Z / 108.883;          //ref_Z = 108.883

	if ( var_X > 0.008856 ) var_X = Math.pow(var_X , 1/3);
	else                    var_X = ( 7.787 * var_X ) + ( 16 / 116 );
	if ( var_Y > 0.008856 ) var_Y = Math.pow(var_Y , 1/3);
	else                    var_Y = ( 7.787 * var_Y ) + ( 16 / 116 );
	if ( var_Z > 0.008856 ) var_Z = Math.pow(var_Z , 1/3);
	else                    var_Z = ( 7.787 * var_Z ) + ( 16 / 116 );

	var L = ( 116 * var_Y ) - 16;
	var a = 500 * ( var_X - var_Y );
	var b = 200 * ( var_Y - var_Z );
	
	//Lab to LCH
	var var_H = Math.atan2(b,a);
	var_H = ( var_H / Math.PI ) * 180;
	
	if(var_H < 0)
		var_H += 360;
	
	var S = Math.max(Math.abs(a), Math.abs(b));
	
	return [var_H, S, L];
}

function revertColor() {
	currentColorHSL = oldColorHSL.slice();
	currentColorRGB = oldColorRGB.slice();
	updateDisplay(PS_UPDATE_FORCE);
}

// interface photoshop ---------------------------------------------------------

// init -----------------------------------------

var MY_COLOR_PICKER_EXT_ID = "com.yannick.MyColorPicker.extension1";

function setPersistent() {
	var event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION");
	event.extensionId = MY_COLOR_PICKER_EXT_ID;
	new CSInterface().dispatchEvent(event);
}

//fonction appelee lorsque la couleur fg change dans photoshop
function colorChangedInPhotoshop(RGB) { 
	currentColorHSL = rGBToHSL(RGB);
	if(isOldColorInitialized == false) {
		oldColorHSL = currentColorHSL.slice();
		oldColorRGB = RGB.slice();
		isOldColorInitialized = true;
	}
	updateDisplay(PS_UPDATE_NO);
}

function initColor() {
	evalScript("_ext_getPSFgColor()", function(res) {
		colorChangedInPhotoshop(res.split(","));
	});
}

function registerCustomEvents() {
	var cs = new CSInterface();
	cs.addEventListener("MyColorPicker_colorChangedEvent", function(event) {
		colorChangedInPhotoshop(event.data.split(","));
	});
	cs.addEventListener("MyColorPicker_incrementHSLEvent", function(event) {
		var eventData = event.data.split(",");
		incrementHSL(eventData[0]*1, eventData[1]*1, true);
	});
	cs.addEventListener("MyColorPicker_addSwatchEvent", function(event) {
		addSwatch();
	});
}

function registerPSEvent() {
	var csInterface = new CSInterface();
	var event_ = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
	event_.extensionId = csInterface.getExtensionID();
	event_.appId = csInterface.getApplicationID();
	event_.data = "1936483188, 1936028772, 1165517672, 1383294324"; //slct, setd, Exch, Rset
	csInterface.dispatchEvent(event_);
	
	csInterface.addEventListener("PhotoshopCallback" , function(event) {
		var script;
		if(isMyself)
			script = "_ext_myself_getPSFgColor()";
		else
			script = "_ext_getPSFgColor()";
//		console.log("photoshop event occured : " + event.data + " - " + (new Date().getTime() - lastPSColorUpdate));
		if(!isMyself || (new Date().getTime() > lastPSColorUpdate + 300)) {
			evalScript(script, function(res) {
				if(res != "")
					colorChangedInPhotoshop(res.split(","));
			})
		}
	});
}


function createFlyoutMenu() {
	var PSVersion = new CSInterface().getHostEnvironment().appVersion.split(".");
	var majorVersion = parseInt(PSVersion[0]);
	var minorVersion = parseInt(PSVersion[1]);
	if(majorVersion > 15 || (majorVersion == 15 && minorVersion >= 2)) {
		var flyoutXML = '\
			<Menu> \
				<MenuItem Id="openHomePageMenuItem" Label="MyColorPicker Home Page..." Enabled="true"/> \
				<MenuItem Id="keyboardShortcutsMenuItem" Label="How To Use Keyboard Shortcuts..." Enabled="true"/> \
				<MenuItem Id="foo" Label="---" Enabled="true"/> \
				<MenuItem Id="aboutMenuItem" Label="About MyColorPicker..." Enabled="true"/> \
			</Menu>';
		var csInterface = new CSInterface();
		csInterface.setPanelFlyoutMenu(flyoutXML);
		csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuClickedHandler);
	}
}

function flyoutMenuClickedHandler (event) {
	var csInterface = new CSInterface();
	if(event.data.menuId == "openHomePageMenuItem")
		csInterface.openURLInDefaultBrowser("http://yannicklerestif.com/photoshop_stuff/my_color_picker.php?oid=1");
	else if(event.data.menuId == "keyboardShortcutsMenuItem")
		csInterface.openURLInDefaultBrowser("http://yannicklerestif.com/photoshop_stuff/my_color_picker.php?oid=2#keyboard_shortcuts");
	else if(event.data.menuId == "aboutMenuItem")
		alert("MyColorPicker version MYCOLORPICKER_VERSION - Thanks for using");
	
}
//-------

function addSwatch() {
	if(isInPhotoshop) {
		var theScript = "_ext_addSwatch(" + currentColorRGB[0] + "," + currentColorRGB[1] + "," + currentColorRGB[2] +")";
		evalScript(theScript, undefined);
	}
	commitColor();
}

function loseFocus() {
	if(isInPhotoshop) {
		var csEvent = new CSEvent("com.adobe.PhotoshopLoseFocus", "APPLICATION");  
		csEvent.extensionId = MY_COLOR_PICKER_EXT_ID; // your extension's id, like com.example.helloworld  
		new CSInterface().dispatchEvent(csEvent); // csInterface is a new CSInterface()
	}
}

function commitColor() {
	oldColorHSL = currentColorHSL.slice();
	oldColorRGB = currentColorRGB.slice();
	updateDisplay(PS_UPDATE_NO);
}

function evalScript(script, callback) {
	new CSInterface().evalScript(script, callback);
}

function updatePSFgColor(psUpdate) {
	if(!isInPhotoshop || psUpdate == PS_UPDATE_NO || psUpdate == PS_UPDATE_DELAY)
		return;
	var functionName;
	if(!isMyself)
		functionName = "_ext_changePSFgColor";
	else {
		functionName = "_ext_myself_changePSFgColor";
		lastPSColorUpdate = new Date().getTime();
	}
	evalScript(functionName + "(" + currentColorRGB[0] + "," + currentColorRGB[1] + "," + currentColorRGB[2] + ")", undefined);
}
