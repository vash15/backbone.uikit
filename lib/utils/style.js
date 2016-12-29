var _elementStyle = document.createElement('div').style;
var _transition   = 'webkitTransition' in _elementStyle ? 'webkitTransition' : 'transition';
var _transform    = 'webkitTransform' in _elementStyle ? 'webkitTransform' : 'transform';
var _backface     = 'webkitBackfaceVisibility' in _elementStyle ? 'webkitBackfaceVisibility' : 'backfaceVisibility';

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
function requestNextAnimationFrame(callback){
	requestAnimationFrame(function () {
        requestAnimationFrame(function (ts) {
            callback(ts);
        });
    });
};


module.exports = {
	transition : _transition,
	transform  : _transform,
	backface   : _backface,
	requestNextAnimationFrame: requestNextAnimationFrame
};