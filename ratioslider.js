/*!
 * Ratio Slider
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

function RatioSlider(elmId, segs, total){
	this.initialSegments = segs;
	this.total = total; //total percentage (e.g. 130%)
	this.segments = new Array();
	this.elmId = elmId;
	this.allowUnderAllocation = false; //will allow the user to select less than the full amount (broken at the moment)
	this.segmentMinWidth = 10;
	this.increment = 1; //increments in percent
}

RatioSlider.prototype.init  = function(){
	var newHtml = '<div class="ratioslider" id="' + this.elmId + '"><div id="total"></div><div id="reset">Reset</div></div>';

	//Replace input field with custom slider
	$('input#'+this.elmId).replaceWith(newHtml);
	
	//Add text
	$('#'+this.elmId+'>#total').text(this.total+'%');
	
	//Add handles and generally set this up
	$('#'+this.elmId+'>#reset').bind('click', {that:this}, this.resetSlider);
	
	$.each(this.initialSegments, function(sName, sVal){
       addSegment(sName, sVal);
    })

	this.attachHandles();
	this.adjustSegments();
}

RatioSlider.prototype.resetSlider = function(event,ui){
	var that = event.data.that;
	for (var i=0;i<that.segments.length;i++){
		that.segments[i].setRatio();
	}
	that.adjustSegments();
}

RatioSlider.prototype.addSegment = function(label, rat){
	var seg = new RatioSegment(this);
	seg.label = label;
	seg.originalRatio = rat;
	this.segments.push(seg);
}

RatioSlider.prototype.attachHandles = function(){
	var range = this.segments.length;
			
	for (var i=0; i<range; i++){
		this.segments[i].addHtml(this.elmId);
		this.segments[i].setRatio();
		this.segments[i].maxWidth = $(this.obj).width()-this.segmentMinWidth*(range-1);
		
		if (i<range-1 || this.allowUnderAllocation){
			this.segments[i].makeResizable();
			$(this.segments[i].obj).bind('resizestart', {that: this}, this.startResizing);
			$(this.segments[i].obj).bind('resizestop', {that: this}, this.stopResizing);
		}
	}
}

RatioSlider.prototype.startResizing = function(event, ui){
	var that = event.data.that;
	$(ui.element).bind('resize', {that:that}, that.adjustSegments);
	var maxWidth=0;
	for (var i=0; i<that.segments.length-1; i++){
		that.segments[i].originalWidth = $(that.segments[i].obj).width();
		that.segments[i].originalRight = $(that.segments[i].obj).width()+$(that.segments[i].obj).offset().left;
	}
	
	for (var i=0;i<that.segments.length-1;i++){
		if (that.segments[i].elmId==$(ui.element).attr('id')){
			var offset = $(that.segments[i].obj).offset().left;
			maxWidth = $('#'+that.elmId).width()-offset-((that.segments.length-i-2)*that.segmentMinWidth);
			$(ui.element).resizable( "option", "maxWidth", maxWidth );
			break;
		}
	}
}

RatioSlider.prototype.stopResizing = function(event, ui){
	var that = event.data.that;
	$(ui.element).unbind("resize", {that:that}, that.adjustSegments);
}

RatioSlider.prototype.adjustSegments = function(event, ui){
	var that;
	
	try {
		that = event.data.that;
	} catch (e) {
		that = this;	
	}
	
	//Reposition other elements
	var parentWidth = $('#'+that.elmId).width(); //max width of the segments combined
	var nextObj;

	var currentIndex;

	//Find resized div and link back to object
	try {
		for (var i=0;i<that.segments.length-1;i++){
			if (that.segments[i].elmId==$(ui.element).attr('id')){
				currentIndex = i;
			}
		}
	} catch (e) {
		currentIndex = 0;
	}
	
	//Run through and adjust positions and widths	
	for (var i=currentIndex; i<that.segments.length-1; i++){
		var nextObj = that.segments[i+1];
		var curObj = that.segments[i];
		var nextObjDomElm = $(nextObj.obj);
		var curObjDomElm = $(curObj.obj);
		
		nextObjDomElm.offset({left: curObjDomElm.offset().left + curObjDomElm.width()});		
		
		var newWidth = nextObj.originalRight-nextObjDomElm.offset().left;
		
		if (newWidth<that.segmentMinWidth){
			newWidth = that.segmentMinWidth;
		}
		
		nextObjDomElm.width(newWidth);
	}
	
	//Stretch last element if we don't allow underallocation
	if (!that.allowUnderAllocation){
		var totalWidth = 0;
		for (var i=0; i<that.segments.length-1;i++){
			totalWidth+=$(that.segments[i].obj).width();
		}
		
		var lastObj = that.segments[that.segments.length-1];
		$(lastObj.obj).width((parentWidth-totalWidth));
	}
	
	
	
	//React if we overflow
	if (totalWidth>parentWidth){
		console.log('Overflow!'+totalWidth);
		var objNextInLine;
		
		//Get next in line
		for (var i=that.segments.length-1; i>0; i--){
			var obj = $(that.segments[i].obj);
							
			if (obj.width()>that.segments[i].minWidth){
				objNextInLine = that.segments[i];
				break;
			}
		}
		$(objNextInLine.obj).width($(objNextInLine.obj).width()+parentWidth-totalWidth);
	}
	
	//Move callouts
	var overlaps = 0; //count overlaps

	//For storing shift levels
	var ladder = new Array();
	
	//Loop through and check for overlaps
	for (var i=that.segments.length-1; i>=0; i--){
		var curObj = that.segments[i];
		var curObjDomElm = $(curObj.obj);
		var thisPop = $('#'+curObj.popupId+">#content");

		//Shift to the side
		$('#'+curObj.popupId).offset({left: curObjDomElm.offset().left, top:curObjDomElm.offset().top});
		
		//Shift up and down
		if (i<that.segments.length-1){
			if (thisPop.offset().left+thisPop.width()+10 > $('#'+that.segments[i+1].popupId).offset().left){
				overlaps++;
			} else {
				overlaps = 0;
			}
		}
		//Add to array for later
		ladder.push(overlaps);
	}
	
	//Traverse through array and assign CSS shift levels
	ladder.reverse();
	
	for (var i=0; i<ladder.length; i++){
		$('#'+that.segments[i].popupId+">#content").removeClass(); //Remove all existing
		$('#'+that.segments[i].popupId+">#content").addClass("overlap-"+ladder[i]); //Add shift lvl
	}
	
	//Write out the ratios
	that.returnRatios();
}

RatioSlider.prototype.returnRatios = function(){
	ratios = new Array();
	for (var i=0; i<this.segments.length; i++){
		var ratio = this.segments[i].getRatio();
		ratios.push(ratio);
		
		//update text
		this.segments[i].setPercentage(Math.round(ratio*this.total) + '%');
		
		if ($(this.segments[i].obj).width() < 30){
			$('#'+this.segments[i].popupId+'>#content>#percentage').show(200);
			$(this.segments[i].obj+'>#content').hide(200);
		} else {
			$('#'+this.segments[i].popupId+'>#content>#percentage').hide(200);
			$(this.segments[i].obj+'>#content').show(200);
		}
	}
	this.outputData(ratios);
}

RatioSlider.prototype.outputData = function(ratios){
	console.log('['+ratios +'] x '+this.total+'%');
}