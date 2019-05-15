import _ from "underscore";
import BaseView from "./BaseView";


// <iframe id="ytplayer" type="text/html" width="640" height="360"
//   src="https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&origin=http://example.com"
//   frameborder="0"></iframe>

/**
 * Class rappresenting a Youtube iFrame video
 * @extends BaseView
 * @version 2.1.6
 * @param {Object} options - Youtube iframe options
 * @param {String} [options.src] - Youtube's video url
 */
export default class YoutubePlayerView extends BaseView {

	tagName(){
		return 'iframe';
	}

	addClass(){
		return 'youtube-player';
	}

	constructor(options){
		super(options);

		this.setDefaultsOptions({
			src: null
		});
		
	}

	onRender(rendered){
		if (!rendered) {
			const el = this.el;
			//
			// Set the default attribute's
			//
			let attr   = document.createAttribute("type");
			attr.value = "text/html";
			el.setAttributeNode(attr);

			attr       = document.createAttribute("frameborder");
			attr.value = 0;
			el.setAttributeNode(attr);

			attr       = document.createAttribute("allowfullscreen");
			attr.value = "allowfullscreen";
			el.setAttributeNode(attr);

			this.load(this.options.src);
		}
	}

	/**
	 * Load the video on the iframe
	 * @public
	 * @version 2.1.6
	 * @param {String} newSrc - New iframe's src attribute
	 * @return {YoutubePlayerView}
	 */
	load(newSrc){
		if ( this.src == newSrc )
			return this;
		this.src = newSrc;
		if ( this.cache.ra )
			this.cancelAnimationFrame(this.cache.ra);
		this.cache.ra =
			this.requestAnimationFrame(()=>{
				const src = this.getEmbededSrc();
				if ( src ){
					let src   = document.createAttribute("src");
					src.value = this.src;
					this.el.setAttributeNode(src);
				}

			});
		return this;
	}

	/**
	 * Generate the Youtube's embeded link
	 * @public
	 * @version 2.1.6
	 * @return {String} Youtube's url
	 */
	getEmbededSrc(){
		const code = this.getCode();
		if (!code)
			return;
		return `https://www.youtube.com/embed/${code}?rel=0&amp;&amp;showinfo=0`; // controls=0
	}

	/**
	 * Return the youtube'video id from the youtube's link
	 * @public
	 * @version 2.1.6
	 * @return {String|Null}
	 */
	getCode(){
		if(!this.src)
			return null;
		const matches = this.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i)
		return _.isArray(matches) && matches.length > 0 ? matches[1] : null ;
	}

}
