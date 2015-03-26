#target photoshop
var externalObjectName = "PlugPlugExternalObject";
var myLib = new ExternalObject("lib:" + externalObjectName);
var event=new CSXSEvent();
event.type="MyColorPicker_addSwatchEvent";
event.dispatch();
