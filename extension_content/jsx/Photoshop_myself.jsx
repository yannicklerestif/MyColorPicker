//#target photoshop

//lorsque la couleur change dans le picker :
//- si on est dans une layer d'ajustement, on change la couleur de la layer 
//- sinon, on change la fg color
_ext_myself_changePSFgColor = function(R, G, B) {
	var isAdjustingLayer = _ext_private_isAdjustingLayer();
	var targetColor = new SolidColor();
	targetColor.rgb.red = R;
	targetColor.rgb.green = G;
	targetColor.rgb.blue = B;
	if(isAdjustingLayer) {
		_ext_private_setColorOfFillLayer(targetColor);
	} else {
		app.foregroundColor = targetColor;
	}
}

//on recupere la couleur comme pour _ext_myself_changePSFgColor
_ext_myself_getPSFgColor = function() {
	var isAdjustingLayer = _ext_private_isAdjustingLayer();
	var color;
	if(isAdjustingLayer) {
		color = _ext_private_getColorOfFillLayer();
	} else {
		color = app.foregroundColor;
	}
	var result = color.rgb.red + "," + color.rgb.green +"," + color.rgb.blue;
	return result;
}

_ext_private_getSelectedChannelName = function() {
    var ref = new ActionReference();
    ref.putEnumerated( charIDToTypeID("Chnl"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
    return executeActionGet(ref).getString(charIDToTypeID("ChnN"));
}

_ext_private_isAdjustingLayer = function() {
	try {
        app.activeDocument;
    } catch (e) {
        return false;
    } 
    if(app.activeDocument.activeLayer == undefined)
        return false;
    return app.activeDocument.activeLayer.name == "Color_adjusting_layer";
}

/*_ext_private_isAdjustingLayerAndColorChannel = function() {
	try {
	    app.activeDocument;
	} catch (e) {
	    return false;
	} 
	if(app.activeDocument.activeLayer == undefined)
	    return false;
	if(!(app.activeDocument.activeLayer.kind == LayerKind.SOLIDFILL))
	    return false;
	if(_ext_private_getSelectedChannelName()== "RGB")
	    return true;
	else
	    return false;
}*/

_ext_private_setColorOfFillLayer = function ( sColor ) {
    var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated( stringIDToTypeID('contentLayer'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    desc.putReference( charIDToTypeID('null'), ref );
        var fillDesc = new ActionDescriptor();
            var colorDesc = new ActionDescriptor();
            colorDesc.putDouble( charIDToTypeID('Rd  '), sColor.rgb.red );
            colorDesc.putDouble( charIDToTypeID('Grn '), sColor.rgb.green );
            colorDesc.putDouble( charIDToTypeID('Bl  '), sColor.rgb.blue );
        fillDesc.putObject( charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc );
    desc.putObject( charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc );
   executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );
}

_ext_private_getColorOfFillLayer = function() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref);
   var adjs = desc.getList(charIDToTypeID('Adjs'));
   var clrDesc = adjs.getObjectValue(0);
   var color= clrDesc.getObjectValue(charIDToTypeID('Clr '));
   var red = color.getDouble(charIDToTypeID('Rd  '));
   var green = color.getDouble(charIDToTypeID('Grn '));
   var blue = color.getDouble(charIDToTypeID('Bl  '));
    var targetColor = new SolidColor();
    targetColor.rgb.red = red;
    targetColor.rgb.green = green;
    targetColor.rgb.blue = blue;
    return targetColor;
}