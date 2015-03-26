_ext_getPSFgColor = function() {
	return app.foregroundColor.rgb.red + "," + app.foregroundColor.rgb.green + "," + app.foregroundColor.rgb.blue;	
}

_ext_changePSFgColor = function(R, G, B) {
	var targetColor = new SolidColor();
	targetColor.rgb.red = R;
	targetColor.rgb.green = G;
	targetColor.rgb.blue = B;
	app.foregroundColor = targetColor;
}

_ext_addSwatch = function (R, G, B) {
	if(R > 255) redColor = 255;
	if(G > 255) greenColor = 255;
	if(B > 255) blueColor = 255;	
	var id56 = charIDToTypeID( "Mk  " );
	var desc13 = new ActionDescriptor();
	var id57 = charIDToTypeID( "null" );
		var ref5 = new ActionReference();
		var id58 = charIDToTypeID( "Clrs" );
		ref5.putClass( id58 );
	desc13.putReference( id57, ref5 );
	var id59 = charIDToTypeID( "Usng" );
		var desc14 = new ActionDescriptor();
		var id60 = charIDToTypeID( "Nm  " );
		desc14.putString( id60, "R"+ R + "G"+G+"B"+B);
		var id61 = charIDToTypeID( "Clr " );
			var desc15 = new ActionDescriptor();
			//The red color
			var id62 = charIDToTypeID( "Rd  " );
			desc15.putDouble( id62, R);
			//The green color
			var id63 = charIDToTypeID( "Grn " );
			desc15.putDouble( id63, G);
			//The blue color
			var id64 = charIDToTypeID( "Bl  " );
			desc15.putDouble( id64, B);
		var id65 = charIDToTypeID( "RGBC" );
		desc14.putObject( id61, id65, desc15 );
	var id66 = charIDToTypeID( "Clrs" );
	desc13.putObject( id59, id66, desc14 );
	executeAction( id56, desc13, DialogModes.NO );
}
