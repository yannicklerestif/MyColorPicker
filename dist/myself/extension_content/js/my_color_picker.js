var isOldColorInitialized=false;var currentColorHSL=[0,50,50];var currentColorRGB=[0,0,0];var isMyself=true;var __t=false;
var oldColorHSL=[0,50,50];var oldColorRGB=[0,0,0];var PS_UPDATE_NO=0;var PS_UPDATE_DELAY=1;var PS_UPDATE_FORCE=2;var isDragging;
var clientXBeforeDrag;var clientYBeforeDrag;var colorHSLBeforeDrag;var isInPhotoshop=(typeof window.__adobe_cep__!="undefined");
var lastFocus=new Date().getTime();var lastPSColorUpdate=0;function init(){if(isInPhotoshop){setPersistent();registerPSEvent();
registerCustomEvents();createFlyoutMenu()}tInstall();createMarker();createHueMarker();createUpDownButtons();resizeDisplay();
$(window).mousedown(function(a){windowMouseDown(a)});$(window).mousemove(function(a){windowMouseMove(a)});$(window).mouseup(function(a){windowMouseUp(a)
});$("#color_swatch_old").click(function(){revertColor()});$("#color_swatch_new").click(function(){commitColor()});$("#H_up").click(function(a){a.preventDefault();
incrementHSL(0,1,true)});$("#H_down").click(function(a){incrementHSL(0,-1,true)});$("#S_up").click(function(a){incrementHSL(1,1,true)
});$("#S_down").click(function(a){incrementHSL(1,-1,true)});$("#L_up").click(function(a){incrementHSL(2,1,true)});$("#L_down").click(function(a){incrementHSL(2,-1,true)
})}function incrementHSL(c,a,b){currentColorHSL[c]=currentColorHSL[c]+a;if(a==-1&&currentColorHSL[c]<0){if(c>0){currentColorHSL[c]=0
}else{currentColorHSL[c]+=360}}if(a==1){if(c==0&&currentColorHSL[c]>360){currentColorHSL[c]-=360}if(c>0&&currentColorHSL[c]>100){currentColorHSL[c]=100
}}updateDisplay(b?PS_UPDATE_FORCE:PS_UPDATE_DELAY)}function tInstall(){if(!__t){$("#_t_div").css("visibility","hidden")}}function tClick(){$("#_t_div").css("visibility","hidden")
}function createMarker(){var b=document.getElementById("marker");b.width=9;b.height=9;var a=b.getContext("2d");a.lineWidth="1";
a.beginPath();a.strokeStyle="rgba(0,0,0,255)";a.rect(0.5,0.5,8,8);a.stroke();a.beginPath();a.strokeStyle="rgba(255,255,255,255)";
a.lineWidth="1";a.rect(1.5,1.5,6,6);a.stroke()}function createHueMarker(){var b=document.getElementById("hue_marker");b.width=24;
b.height=9;var a=b.getContext("2d");a.lineWidth="1";a.beginPath();a.strokeStyle="rgba(0,0,0,255)";a.rect(0.5,0.5,23,8);a.stroke();
a.beginPath();a.strokeStyle="rgba(255,255,255,255)";a.lineWidth="1";a.rect(1.5,1.5,21,6);a.stroke()}function createUpDownButtons(){var g=["H","S","L"];
for(var b=0;b<=1;b++){for(var d=0;d<3;d++){var e=(b==0?"_up":"_down");var f=document.getElementById(g[d]+e);f.width=15;f.height=11;
var a=f.getContext("2d");a.fillStyle="rgba(0,0,0,100)";a.beginPath();if(b==0){a.moveTo(3.5,8);a.lineTo(11.5,8);a.lineTo(7.5,4);
a.lineTo(3.5,8)}else{a.moveTo(3.5,3);a.lineTo(11.5,3);a.lineTo(7.5,7);a.lineTo(3.5,3)}a.closePath();a.fill()}}}var draggableComponents=["canvas1","hue_slider"];
var draggableSpinners=["H_spinner","S_spinner","L_spinner"];function draggableType(a){for(var b=0;b<draggableComponents.length;
b++){if(a==draggableComponents[b]){return 1}}for(var b=0;b<draggableSpinners.length;b++){if(a==draggableSpinners[b]){return 2
}}return 0}function windowMouseDown(c){var b=c.target.id;var a=draggableType(b);if(a>0){isDragging=b;c.preventDefault()}if(a==1){moveTo(b,c.clientX,c.clientY)
}else{if(a==2){clientXBeforeDrag=c.clientX;clientYBeforeDrag=c.clientY;colorHSLBeforeDrag=currentColorHSL.slice()}}}function windowMouseUp(a){if(typeof isDragging!=="undefined"){updateDisplay(PS_UPDATE_FORCE)
}isDragging=undefined;if(isMyself&&document.hasFocus()){loseFocus()}}function windowMouseMove(b){if(typeof isDragging!=="undefined"){var a=draggableType(isDragging);
if(a==1){moveTo(isDragging,b.clientX,b.clientY)}else{if(a==2){dragSpinner(isDragging,b.clientX,b.clientY)}}}if(isMyself&&document.hasFocus()){loseFocus()
}}function dragSpinner(a,d,c){var b,e;if(a=="H_spinner"){b=0;e=360}else{if(a=="S_spinner"){b=1;e=100}else{if(a=="L_spinner"){b=2;
e=100}}}currentColorHSL[b]=colorHSLBeforeDrag[b]-e*(c-clientYBeforeDrag)/$("#canvas1").height();if(b==0){currentColorHSL[0]=currentColorHSL[0]%360;
if(currentColorHSL[0]<0){currentColorHSL[0]+=360}}else{if(currentColorHSL[b]<0){currentColorHSL[b]=0}if(currentColorHSL[b]>100){currentColorHSL[b]=100
}}updateDisplay(PS_UPDATE_DELAY)}function moveTo(a,e,d){var f=$("#"+a);var g=f.position();var c=e-g.left;var b=d-g.top;if(a=="canvas1"){if(c<0){c=0
}if(c>=f.width()){c=f.width()-1}if(b<0){b=0}if(b>=f.height()){b=f.height()-1}moveMarker(c,b)}else{if(a=="hue_slider"){moveHueMarker(c,b)
}}}function moveMarker(b,a){currentColorHSL[1]=posToValue($("#canvas1").width(),100,b,undefined);currentColorHSL[2]=posToValue($("#canvas1").height(),100,a,true);
updateDisplay(PS_UPDATE_DELAY)}function moveHueMarker(c,b){var a=posToValue($("#hue_slider").height(),360,b,true)%360;if(a<0){a+=360
}currentColorHSL[0]=a;updateDisplay(PS_UPDATE_DELAY)}function resizeDisplay(){var b=$(window).width();var c=$(window).height();
var a=c-5*3-57;$("#canvas1").width(b-5*3-20);$("#canvas1").height(a);$("#hue_slider").height(a);$("#_t_div").width(b);$("#_t_div").height(c);
updateDisplay(PS_UPDATE_NO)}function updateDisplay(a){updateHueSlider();updateHueMarkerPosition();updateCanvas1();updateMarkerPosition();
updateNewColorSwatch();updateOldColorSwatch();updateSpinners();updatePSFgColor(a)}function valueToPos(c,f,e,d){if(typeof d==="undefined"){d=false
}var b=e/f;if(d){b=1-b}var a=Math.round(b*(c-1));return a}function posToValue(a,d,e,b){if(typeof b==="undefined"){b=false
}var c=e/(a-1);if(b){c=1-c}return c*d}function updateNewColorSwatch(){var a=("rgba("+Math.round(currentColorRGB[0])+","+Math.round(currentColorRGB[1])+","+Math.round(currentColorRGB[2])+",255)");
$("#color_swatch_new").css({backgroundColor:a})}function updateOldColorSwatch(){var a=("rgba("+Math.round(oldColorRGB[0])+","+Math.round(oldColorRGB[1])+","+Math.round(oldColorRGB[2])+",255)");
$("#color_swatch_old").css({backgroundColor:a})}function updateSpinners(){$("#H_spinner").text("H:"+Math.round(currentColorHSL[0]));
$("#S_spinner").html("S:"+Math.round(currentColorHSL[1]));$("#L_spinner").html("L:"+Math.round(currentColorHSL[2]));$("#R_spinner").html("R:"+currentColorRGB[0]);
$("#G_spinner").html("G:"+currentColorRGB[1]);$("#B_spinner").html("B:"+currentColorRGB[2])}function updateFocusState(){var a=document.hasFocus()?"white":"black";
$("#focus_state").css({backgroundColor:a})}function updateMarkerPosition(){var h=$("#canvas1").position();var d=valueToPos($("#canvas1").width(),100,currentColorHSL[1],undefined);
var k=valueToPos($("#canvas1").height(),100,currentColorHSL[2],true);var j=h.left+d-4;var i=h.top+k-4;$("#marker").css({position:"fixed",left:(j+"px"),top:(i+"px")});
var e=document.getElementById("canvas1");var f=e.getContext("2d");var c=document.getElementById("canvas1");var b=valueToPos(c.width,100,currentColorHSL[1],undefined);
var g=valueToPos(c.height,100,currentColorHSL[2],true);var a=f.getImageData(b,g,1,1).data;currentColorRGB=[a[0],a[1],a[2]]
}function updateHueMarkerPosition(){var c=$("#hue_slider").position();var a=c.left-2;var b=c.top+valueToPos($("#hue_slider").height(),360,currentColorHSL[0],true)-4;
$("#hue_marker").css({position:"fixed",left:(a+"px"),top:(b+"px")})}function updateHueSlider(){var k=document.getElementById("hue_slider");
k.width=1;k.height=360;var l=k.getContext("2d");var c=k.width;var q=k.height;var a;a=l.createImageData(c,q);for(var e=0;e<q;
e++){var m=posToValue(q,Math.PI*2,e,true);var d=Math.cos(m);var h=Math.sin(m);var g,p,b,o;for(o=100;o>0;o--){var n=LCHToRGB(o,d,h,100);
g=Math.round(n[0]*255);p=Math.round(n[1]*255);b=Math.round(n[2]*255);if(g<=255&&p<=255&&b<=255){break}}for(var f=0;f<c;f++){updateImageData(a,c,f,e,g,p,b)
}}l.putImageData(a,0,0)}function updateCanvas1(){var k=currentColorHSL[0];var d=document.getElementById("canvas1");d.width=100;
d.height=100;var l=d.getContext("2d");var q=d.width;var p=d.height;var y=l.createImageData(q,p);var s=k*Math.PI/180;var w=Math.cos(s);
var e=Math.sin(s);var h;var r;var x;for(var u=0;u<p;u++){var g=posToValue(p,100,u,true);for(var v=0;v<q;v++){var n=posToValue(q,100,v,undefined);
var A,z;var c=LCHToRGB(g,w,e,n);var f=Math.round(c[0]*255);var m=Math.round(c[1]*255);var o=Math.round(c[2]*255);if(f>255||m>255||o>255||f<0||m<0||o<0){f=h;
m=r;o=x}else{h=f;r=m;x=o}updateImageData(y,q,v,u,f,m,o)}}l.putImageData(y,0,0)}function updateImageData(l,e,d,c,h,f,a){var k=4*(c*e+d);
l.data[k++]=h;l.data[k++]=f;l.data[k++]=a;l.data[k]=255}function LCHToRGB(i,p,e,m){var u,r;if(Math.abs(p)>Math.abs(e)){u=p>0?m:-m;
r=u*e/p}else{r=e>0?m:-m;u=r*p/e}var k=(i+16)/116;var l=u/500+k;var j=k-r/200;if(Math.pow(k,3)>0.008856){k=Math.pow(k,3)}else{k=(k-16/116)/7.787
}if(Math.pow(l,3)>0.008856){l=Math.pow(l,3)}else{l=(l-16/116)/7.787}if(Math.pow(j,3)>0.008856){j=Math.pow(j,3)}else{j=(j-16/116)/7.787
}var f=95.047*l;var d=100*k;var c=108.883*j;var q=f/100;var o=d/100;var n=c/100;var s=q*3.2406+o*-1.5372+n*-0.4986;var g=q*-0.9689+o*1.8758+n*0.0415;
var h=q*0.0557+o*-0.204+n*1.057;if(s>0.0031308){s=1.055*(Math.pow(s,(1/2.4)))-0.055}else{s=12.92*s}if(g>0.0031308){g=1.055*(Math.pow(g,(1/2.4)))-0.055
}else{g=12.92*g}if(h>0.0031308){h=1.055*(Math.pow(h,(1/2.4)))-0.055}else{h=12.92*h}return[s,g,h]}function rGBToHSL(i){var n=(i[0]/255);
var e=(i[1]/255);var k=(i[2]/255);if(n>0.04045){n=Math.pow((n+0.055)/1.055,2.4)}else{n=n/12.92}if(e>0.04045){e=Math.pow((e+0.055)/1.055,2.4)
}else{e=e/12.92}if(k>0.04045){k=Math.pow((k+0.055)/1.055,2.4)}else{k=k/12.92}n=n*100;e=e*100;k=k*100;var g=n*0.4124+e*0.3576+k*0.1805;
var f=n*0.2126+e*0.7152+k*0.0722;var d=n*0.0193+e*0.1192+k*0.9505;var l=g/95.047;var j=f/100;var h=d/108.883;if(l>0.008856){l=Math.pow(l,1/3)
}else{l=(7.787*l)+(16/116)}if(j>0.008856){j=Math.pow(j,1/3)}else{j=(7.787*j)+(16/116)}if(h>0.008856){h=Math.pow(h,1/3)}else{h=(7.787*h)+(16/116)
}var o=(116*j)-16;var q=500*(l-j);var p=200*(j-h);var c=Math.atan2(p,q);c=(c/Math.PI)*180;if(c<0){c+=360}var m=Math.max(Math.abs(q),Math.abs(p));
return[c,m,o]}function revertColor(){currentColorHSL=oldColorHSL.slice();currentColorRGB=oldColorRGB.slice();updateDisplay(PS_UPDATE_FORCE)
}var MY_COLOR_PICKER_EXT_ID="com.yannick.MyColorPicker.extension1";function setPersistent(){var a=new CSEvent("com.adobe.PhotoshopPersistent","APPLICATION");
a.extensionId=MY_COLOR_PICKER_EXT_ID;new CSInterface().dispatchEvent(a)}function colorChangedInPhotoshop(a){currentColorHSL=rGBToHSL(a);
if(isOldColorInitialized==false){oldColorHSL=currentColorHSL.slice();oldColorRGB=a.slice();isOldColorInitialized=true}updateDisplay(PS_UPDATE_NO)
}function initColor(){evalScript("_ext_getPSFgColor()",function(a){colorChangedInPhotoshop(a.split(","))})}function registerCustomEvents(){var a=new CSInterface();
a.addEventListener("MyColorPicker_colorChangedEvent",function(b){colorChangedInPhotoshop(b.data.split(","))});a.addEventListener("MyColorPicker_incrementHSLEvent",function(c){var b=c.data.split(",");
incrementHSL(b[0]*1,b[1]*1,true)});a.addEventListener("MyColorPicker_addSwatchEvent",function(b){addSwatch()})}function registerPSEvent(){var b=new CSInterface();
var a=new CSEvent("com.adobe.PhotoshopRegisterEvent","APPLICATION");a.extensionId=b.getExtensionID();a.appId=b.getApplicationID();
a.data="1936483188, 1936028772, 1165517672, 1383294324";b.dispatchEvent(a);b.addEventListener("PhotoshopCallback",function(d){var c;
if(isMyself){c="_ext_myself_getPSFgColor()"}else{c="_ext_getPSFgColor()"}if(!isMyself||(new Date().getTime()>lastPSColorUpdate+300)){evalScript(c,function(e){if(e!=""){colorChangedInPhotoshop(e.split(","))
}})}})}function createFlyoutMenu(){var e=new CSInterface().getHostEnvironment().appVersion.split(".");var a=parseInt(e[0]);
var d=parseInt(e[1]);if(a>15||(a==15&&d>=2)){var b='			<Menu> 				<MenuItem Id="openHomePageMenuItem" Label="MyColorPicker Home Page..." Enabled="true"/> 				<MenuItem Id="keyboardShortcutsMenuItem" Label="How To Use Keyboard Shortcuts..." Enabled="true"/> 				<MenuItem Id="foo" Label="---" Enabled="true"/> 				<MenuItem Id="aboutMenuItem" Label="About MyColorPicker..." Enabled="true"/> 			</Menu>';
var c=new CSInterface();c.setPanelFlyoutMenu(b);c.addEventListener("com.adobe.csxs.events.flyoutMenuClicked",flyoutMenuClickedHandler)
}}function flyoutMenuClickedHandler(a){var b=new CSInterface();if(a.data.menuId=="openHomePageMenuItem"){b.openURLInDefaultBrowser("http://yannicklerestif.com/photoshop_stuff/my_color_picker.php?oid=1")
}else{if(a.data.menuId=="keyboardShortcutsMenuItem"){b.openURLInDefaultBrowser("http://yannicklerestif.com/photoshop_stuff/my_color_picker.php?oid=2#keyboard_shortcuts")
}else{if(a.data.menuId=="aboutMenuItem"){alert("MyColorPicker version 1.4.0 - Thanks for using")}}}}function addSwatch(){if(isInPhotoshop){var a="_ext_addSwatch("+currentColorRGB[0]+","+currentColorRGB[1]+","+currentColorRGB[2]+")";
evalScript(a,undefined)}commitColor()}function loseFocus(){if(isInPhotoshop){var a=new CSEvent("com.adobe.PhotoshopLoseFocus","APPLICATION");
a.extensionId=MY_COLOR_PICKER_EXT_ID;new CSInterface().dispatchEvent(a)}}function commitColor(){oldColorHSL=currentColorHSL.slice();
oldColorRGB=currentColorRGB.slice();updateDisplay(PS_UPDATE_NO)}function evalScript(a,b){new CSInterface().evalScript(a,b)
}function updatePSFgColor(a){if(!isInPhotoshop||a==PS_UPDATE_NO||a==PS_UPDATE_DELAY){return}var b;if(!isMyself){b="_ext_changePSFgColor"
}else{b="_ext_myself_changePSFgColor";lastPSColorUpdate=new Date().getTime()}evalScript(b+"("+currentColorRGB[0]+","+currentColorRGB[1]+","+currentColorRGB[2]+")",undefined)
};