/*!
 * Ratio Segment
 *
 * RatioSlider for OpenIDEO
 * http://www.openideo.com/
 *
 * Copyright 2011, Tobias Toft, IDEO Llc
 *
 * Thanks to the brilliant people behind JQuery
 * http://jquery.com
 *
 * Date: 6 September 2011
 */ 

function RatioSegment(owner){
	this.owner = owner; //owning object
	this.elmId = "handle"+this.owner.segments.length;
	this.popupId = owner.elmId+'-'+this.elmId+'-popup';
	this.minWidth = 10;
	this.maxWidth = owner.total;
	this.obj = '#'+owner.elmId+'>#'+this.elmId; //DOM selector (makes life easier)
	this.label = "Undefined";
	this.wentSmaller = false;
	
	this.originalRight; //<-- We don't really need to declare these guys here
	this.originalRatio; //    but they're nice as a reminder that they exist
	this.originalWidth; // 
}

RatioSegment.prototype.addHtml = function(){
	//add div
	$('#'+this.owner.elmId).append('<div class="handle" id="'+this.elmId+'"><div id="content">0%</div></div>');
	$('body').append('<div class="popup" id="' + this.popupId + '"><div id="content"><div id="label"></div><div id="percentage"></div></div></div>');
	this.setPopupText(this.label);
}

RatioSegment.prototype.makeResizable = function(){
	//attach behaviour
	var inc = $('#'+this.owner.elmId).width()/this.owner.total*this.owner.increment;
	$(this.obj).resizable({
		axis:'x', 
		containment:'parent', 
		minWidth:this.minWidth, 
		maxWidth:this.maxWidth, 
		grid:[inc,inc],
		handles: 'e'}
	);
}

RatioSegment.prototype.setRatio = function(val){ //always in fractions of 1
	if (val==undefined){
		val = this.originalRatio;
	}
	$(this.obj).width(val*$('#'+this.owner.elmId).width());
}

RatioSegment.prototype.getRatio = function(){
	var ratio = $(this.obj).width() / $('#'+this.owner.elmId).width(); //always in fractions of 1
	return ratio;
}

RatioSegment.prototype.setPopupText = function(txt){
	$('#'+this.popupId+'>#content>#label').text(txt);
}

RatioSegment.prototype.setPercentage = function(txt){
	$('#'+this.popupId+'>#content>#percentage').text(txt);
	$(this.obj+'>#content').text(txt);
}