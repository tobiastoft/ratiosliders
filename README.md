# RatioSlider version 0.1 for OpenIDEO

Copyright 2011, Tobias Toft, IDEO Llc

* Thanks to the brilliant people behind JQuery
http://jquery.com
* JQuery UI
http://jqueryui.com
* And the jquery-json plugin
http://code.google.com/p/jquery-json/

6 September 2011

## Description
Replaces any DOM element with a segmented slider. The slider contains a 
hidden form field with the same name as the replaced element, containing 
the output values from the slider. The output values are returned as a 
JSON string with the same format as the string used to set up the slider.

## How to use
The slider is built on JQuery 1.6.2 and JQuery UI 1.8.16. These are
included in this package, however, can be left out if the site is
already using JQuery.

The following files would normally need to be included in the html:

	<!-- JQuery -->
	<link type="text/css" href="css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />	
	<script type="text/javascript" src="jquery-1.6.2.min.js"></script>
	<script type="text/javascript" src="jquery-ui-1.8.16.custom.min.js"></script>
	<script type="text/javascript" src="jquery.json-2.2.min.js"></script>
	
	<!-- RatioSlider -->
	<link rel="stylesheet" type="text/css" href="css/ratioslider.css" />
	<script type="text/javascript" src="ratiosegment.js"></script>
	<script type="text/javascript" src="ratioslider.js"></script>
	
	
Alternatively, instead of ratiosegment.js and ratioslider.js the file 
'ratioslider.min.js' can be used, which is a minified version of the
two uncompressed files. It has been compressed using Google's Closure
Compiler. See 'example.min.htm' for an example. Please note, that since 
this is relying on the JQuery document.ready() function, the CSS for the 
slider needs to be loaded before the JS.

There are two ways of configuring the slider. It can be done as a part
of the creation of the RatioSlider object or the configuration can be
stored in the form field that the slider is replacing.
In any case, the slider is set up by passing it a JSON string containing
the desired segments and the total value (e.g. 130% for overprovisioning).

A new slider is configured like this:

	var mySlider = new RatioSlider(DOMobject, config);

Where DOMobject is the object to replace (e.g. a text field). The 'config'
parameter is optional, if omitted the RatioSlider class will look for a
suitable configuration string in the DOMobject's 'value' field.

The JSON configuration format looks like this:

	{"segments":{
		"Segment A":0.4,
		"Segment B":0.3,
		"Segment C":0.3,
		},
		"total":110
	}

The 'segments' portion defines the segments by name and initial value.
NOTE: The values are always fractions of 1, even when overprovisioning.

The 'total' is the total percentage, normally 100% but when over- or 
underprovisioning it will be e.g. 70% or 130%. The segments are always
calculated as fractions of 1.

Here's an example of a slider that will replace the form element 
named "ratioslider2":

	var rs2 = new RatioSlider("ratioslider2", {"segments":{"Cheese burger":0.4,"Kebab":0.3,"Falafel":0.1,"Hot dog":0.2},"total":130});

Please see the included 'example.htm' for an example of two sliders and 
example.min.htm for a version using the minified JS. The visual design
of the sliders is defined in the 'css/ratioslider.css' file.

Please note that this is a very early and not very thoroughly tested 
version of the slider.
