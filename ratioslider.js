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

function RatioSlider(elmId, setup){
	//Init variables
	this.segments = new Array();
	this.elmId = elmId;
	this.segmentMinWidth = 10; //in pixels
	this.increment = 1; //increments in percent when sliding
	
	//Read the JSON setup
	if (setup==undefined){
		try {
			setup = $.parseJSON($('#'+elmId).val()); //Valid JSON?
		} catch (e) {
			alert('Missing or malformed JSON received through\nfield value for slider named "' + elmId + '."');
			return;
		}
	}
	
	this.initialSetup = setup; //json
	this.total = setup.total; //total percentage (e.g. 130%)
	
	//Init
	this.init();
}


RatioSlider.prototype.init  = function(){
	//Define the replacement html, including a hidden form field
	var newHtml = '<div class="ratioslider" id="' + this.elmId + '"><div id="total"></div><div id="reset">Reset</div><input type="hidden" name="' + this.elmId + '"/></div>';

	//Replace input field with custom slider
	$('input#'+this.elmId).replaceWith(newHtml);
	
	//Add text
	$('#'+this.elmId+'>#total').text(this.total+'%');
	
	//Add handles and generally set this up
	$('#'+this.elmId+'>#reset').bind('click', {that:this}, this.resetSlider);
	
	var that = this; //keep scope
	$.each(this.initialSetup.segments, function(sName, sVal){
       that.addSegment(sName, sVal);
    })

	this.attachHandles();
	this.adjustSegments();	
	this.outputData(true); //Write initial value to hidden form field
}

RatioSlider.prototype.resetSlider = function(event,ui){
	var that = event.data.that;

	for (var i=0;i<that.segments.length;i++){
		that.segments[i].setRatio();
		that.segments[i].originalRight = $(that.segments[i].obj).width()+$(that.segments[i].obj).offset().left;
			that.adjustSegments();

	}
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
		
		if (i<range-1){
			this.segments[i].makeResizable();
			$(this.segments[i].obj).bind('resizestart', {that: this}, this.startResizing);
			$(this.segments[i].obj).bind('resizestop', {that: this}, this.stopResizing);
		}
		
		if (i>0 && i<range-1){
			$(this.segments[i].obj).addClass('mid');
		}
	}
	
	$(this.segments[0].obj).addClass('first');
	$(this.segments[range-1].obj).addClass('last');	
}

RatioSlider.prototype.startResizing = function(event, ui){
	var that = event.data.that;
	$(ui.element).bind('resize', {that:that}, that.adjustSegments);
	var maxWidth=0;
	
	for (var i=0; i<that.segments.length-1; i++){
		that.segments[i].originalRight = $(that.segments[i].obj).width()+$(that.segments[i].obj).offset().left;
		that.segments[i].originalWidth = $(that.segments[i].obj).width();
		that.segments[i].wentSmaller = false;
	}
	
	for (var i=0;i<that.segments.length;i++){
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
	that.returnRatios(true);
}

RatioSlider.prototype.adjustSegments = function(event, ui){
	var that;
	var x = 0;

	try {
		that = event.data.that;
	} catch (e) {
		that = this;
	}
		
	//Reposition other elements
	var parentWidth = $('#'+that.elmId).width(); //max width of the segments combined

	//Find resized div and link back to object
	var currentIndex;
	try {
		for (var i=0;i<that.segments.length-1;i++){
			if (that.segments[i].elmId==$(ui.element).attr('id')){
				currentIndex = i;
			}
		}
	} catch (e) {
		currentIndex = 0;
	}
		
	try {
		x = event.pageX - $(ui.element).offset().left;
	} catch (e){}
	
		
	//Move back
	if (x<0 && currentIndex>0){
		if ($(ui.element).offset().left + x > that.segmentMinWidth*(currentIndex+1)){
			var val = $(ui.element).offset().left + x;
			var grid = $('#'+that.elmId).width()/that.total*that.increment;
			var snap = grid * Math.round(val/grid);
		    $(ui.element).offset({left:snap});
		} else {
			$(ui.element).offset({left:that.segmentMinWidth*(currentIndex+1)});
		}
	}
	
	//Set elements before current
	for (var i=currentIndex-1;i>=0;i--){
		var newLeft;
		var newWidth;
		
		var cObj = that.segments[i];
		var nObj = that.segments[i+1];
		
		var cObjD = $(that.segments[i].obj);
		var nObjD = $(that.segments[i+1].obj);
		
		newLeft = cObjD.offset().left;
		newWidth = nObjD.offset().left-cObjD.offset().left;
		
		if (i>0){
			if (newWidth<that.segmentMinWidth){
				newWidth = that.segmentMinWidth;
			}
			newLeft = nObjD.offset().left-newWidth;
		}
		
		if (cObjD.width()<cObj.originalWidth){
			cObj.wentSmaller = true;
		}
		
		if (nObjD.width()>nObj.originalWidth && nObj.wentSmaller){
			var diff = nObjD.width()-nObj.originalWidth;
			newWidth+=diff;
			nObjD.offset({left:nObjD.offset().left+diff});
			nObjD.width(nObjD.width()-diff);
		}
		
		if (newWidth<that.segmentMinWidth){
			newWidth = that.segmentMinWidth;
		}
		
		cObjD.width(newWidth);
		cObjD.offset({left: newLeft});
	}
		
	//Set elements after current
	for (var i=currentIndex; i<that.segments.length-1; i++){
		var nObj = that.segments[i+1];
		var cObj = that.segments[i];
		var nObjD = $(nObj.obj);
		var cObjD = $(cObj.obj);
			
		nObjD.offset({left: cObjD.offset().left + cObjD.width()});		
			
		var newWidth = nObj.originalRight-nObjD.offset().left;
			
		if (newWidth<that.segmentMinWidth){
			newWidth = that.segmentMinWidth;
		}
			
		nObjD.width(newWidth);
	}
		
	
	//Stretch last element, we don't allow underallocation
	var totalWidth = 0;
	for (var i=0; i<that.segments.length-1;i++){
		totalWidth+=$(that.segments[i].obj).width();
	}
		
	var lastObj = that.segments[that.segments.length-1];
	$(lastObj.obj).width((parentWidth-totalWidth));
	
	
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
		//mid
		if (i>0 && i<that.segments.length-1){
			$('#'+that.segments[i].popupId+">#content").addClass('mid');
		}
		$('#'+that.segments[i].popupId+">#content").addClass("overlap-"+ladder[i]); //Add shift lvl
	}
	
	//first, last
	$('#'+that.segments[0].popupId+">#content").addClass('first');
	$('#'+that.segments[that.segments.length-1].popupId+">#content").addClass('last');
	
	//Write out the ratios
	that.returnRatios();
}

RatioSlider.prototype.returnRatios = function(bUpdateField){
	ratios = new Array();
	for (var i=0; i<this.segments.length; i++){
		var ratio = Math.round(this.segments[i].getRatio()*100)/100;
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
	
	if (bUpdateField){
		this.outputData(ratios);
	}
}

RatioSlider.prototype.outputData = function(ratios){
	//Create json output in the same format as the input
	var jsonOutput = '{"segments":{';
	
	for (var i=0; i<this.segments.length; i++){
		jsonOutput += '"' + this.segments[i].label +'":' + Math.round(this.segments[i].getRatio()*100)/100;
		if (i<this.segments.length-1){
			jsonOutput += ',';
		}
	}
	
	jsonOutput += '},"total":' + this.total + '}';
	
	//Update hidden field
	$('input[name="'+this.elmId+'"]').val(jsonOutput);
}