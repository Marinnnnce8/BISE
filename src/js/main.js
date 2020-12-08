/**
 * Main JS
 *
 * @copyright 2020 NB Communication Ltd
 *
 */

var main = {

	init: function() {

		var horizontalContainer = document.getElementsByClassName('horizontal-container')[0];
		var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
		var whaleHunting = document.getElementById('whale-hunting-icon');
		var eggHunting = document.getElementById('egg-hunting-icon');
		var peatCutting = document.getElementById('peat-cutting-icon');
		var dataScrollspyElements = document.querySelectorAll('[data-uk-scrollspy]');
		var audioPlay = document.querySelector('.audio-play');

		if(isIE11) {
			return;
		} else {
			if(horizontalContainer) {
				this.addMultiListener(window, 'load resize', main.horizontalScroll);
			}
		}

		if(whaleHunting) {
			new Vivus('whale-hunting-icon', {type: 'scenario-sync', duration: 3, start: 'inViewport', dashGap: 20, forceRender: false})
		}
		if(eggHunting) {
			new Vivus('egg-hunting-icon', {type: 'scenario-sync', duration: 3, start: 'inViewport', dashGap: 20, forceRender: false})
		}
		if(peatCutting) {
			new Vivus('peat-cutting-icon', {type: 'scenario-sync', duration: 3, start: 'inViewport', dashGap: 20, forceRender: false})
		}

		if(dataScrollspyElements) {
			this.removeScrollspy();
		}

		if(audioPlay) {
			this.audioPlayer();
		}

		nb.profilerStart('main.init');

		// Content
		var blocks = uk.$$('.content');
		if (blocks.length) {

			var alignments = ['left', 'right', 'center'];
			blocks.forEach(function(block) {

				// Apply UIkit table component
				uk.$$('table', block).forEach(function(el) {
					uk.addClass(el, 'uk-table');
					uk.wrapAll(el, '<div class="uk-overflow-auto">');
				});

				// Inline Images UIkit Lightbox/Scrollspy
				(uk.$$('a[href]', block).filter(function(a) {
					return uk.attr(a, 'href').match(/\.(jpg|jpeg|png|gif|webp)/i);
				})).forEach(function(a) {

					var figure = a.parentElement;
					var caption = uk.$('figcaption', figure);

					// uk-lightbox
					uk.attr(figure, 'data-uk-lightbox', 'animation: fade');
					if (caption) uk.attr(a, 'data-caption', nb.wrap(uk.html(caption), 'div'));

					// uk-scrollspy
					for (var i = 0, n = alignments.length, align; i < n; i++) {
						align = alignments[i];
						if (uk.hasClass(figure, 'align_' + align)) {
							UIkit.scrollspy(figure, {
								cls: ('uk-animation-slide-' + (align === 'center' ? 'bottom' : align) + '-small')
							});
						}
					}
				});
			});

			nb.loadComponents();
		}

		nb.profilerStop('main.init');
	},

	renderItems: function(items, config) {

		nb.profilerStart('main.renderItems');

		var metas = ['date_pub', 'dates', 'location'];
		var clsTag = 'uk-label uk-label-primary uk-margin-small-right';

		var out = '';
		for (var i = 0, n = items.length; i < n; i++) {

			var item = items[i];

			// Meta
			var meta = '';
			for (var j = 0, l = metas.length; j < l; j++) {
				var v = item[metas[j]];
				if (v) meta += nb.wrap(v, 'uk-text-meta');
			}

			// Tags
			var tags = '';
			if (config.showTemplate && item.template) {
				tags += nb.wrap(uk.ucfirst(item.template), clsTag);
			}
			if (Array.isArray(item.tags)) {
				item.tags.forEach(function(tag) {
					tags += nb.wrap(tag.title, clsTag);
				});
			}

			// Summary
			var summary = (item.getSummary ? nb.wrap(item.getSummary, 'p') : '');

			out += nb.wrap(
				nb.wrap(
					// Image
					(item.getImage ? nb.wrap(
						nb.link(
							item.url,
							nb.img(item.getImage, {
								alt: item.title,
								sizes: '(min-width: 640px) 50.00vw',
							})
						),
						'uk-card-media-top'
					) : '') +
					// Title / Meta / Tags
					nb.wrap(
						nb.wrap(
							nb.link(item.url, item.title, 'uk-link-reset'),
							'uk-card-title'
						) +
						meta +
						tags,
						'uk-card-header'
					) +
					// Summary
					(summary ? nb.wrap(
						summary,
						'uk-card-body'
					) : '') +
					// CTA
					(config.cta ? nb.wrap(
						nb.link(item.url, config.cta, 'uk-button uk-button-text'),
						'uk-card-footer'
					) : ''),
					'uk-card uk-card-default'
				),
				'div'
			);
		}

		out = nb.wrap(out, {
			class: [
				'uk-child-width-1-2@s',
				'uk-child-width-1-3@m',
				'uk-grid-match',
				'uk-flex-center',
			],
			dataUkGrid: true,
			dataUkScrollspy: {
				target: '> div',
				cls: 'uk-animation-slide-bottom-small',
				delay: NBkit.options.duration,
			}
		}, 'div');

		nb.profilerStop('main.renderItems');

		return out;
	},

	//combining multiple event listeners
	addMultiListener: function(element, eventNames, listener) {
		var events = eventNames.split(' ');
		for (var i=0, iLen=events.length; i<iLen; i++) {
			element.addEventListener(events[i], listener, false);
		}
	},

	horizontalScroll: function() {
		var isDesktop = window.matchMedia("(min-width: 1201px)").matches;
		var spaceHolder = document.querySelector('.horizontal-holder');

		if (isDesktop) {
			var horizontal = document.querySelector('.horizontal-inner');
			spaceHolder.style.height = `${calcDynamicHeight(horizontal)}px`;

			function calcDynamicHeight(ref) {
				var vw = window.innerWidth;
				var vh = window.innerHeight;
				var objectWidth = ref.scrollWidth;
				return objectWidth - vw + vh + 150;
			}

			window.addEventListener('scroll', function () {
				var sticky = document.querySelector('.horizontal-sticky');
				horizontal.style.transform = `translateX(-${sticky.offsetTop}px)`;
			});

			window.addEventListener('resize', function () {
				var isDesktop = window.matchMedia("(min-width: 1201px)").matches;
				if (isDesktop) {
					spaceHolder.style.height = `${calcDynamicHeight(horizontal)}px`;
				}
			});
		} else {
			spaceHolder.style.height = 0;
			spaceHolder.style.height = 100 + "%";
		}
	},

	removeScrollspy: function() {
		var dataScrollspyElements = document.querySelectorAll('[data-uk-scrollspy]');
		var isTablet = window.matchMedia("(max-width: 1200px)").matches;

		if(isTablet) {
			for(var i = 0; i <dataScrollspyElements.length;i++) {
				dataScrollspyElements[i].removeAttribute('data-uk-scrollspy');
			}
		}
	},

	audioPlayer: function() {
		function fmtMSS(s) {
			return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
		}

		var audioPlay = document.querySelector('.audio-play');
		var audioSound = document.querySelector('.audio-sound');
		  
		audioPlay.addEventListener("click", function(e) {
			var thisElement = e.target;
			var playerId = thisElement.getAttribute("data-id");
			var audioElement = document.querySelector("#player" + playerId);
			console.log(audioElement);
			
			if (audioElement.classList.contains("audio-playing")) {
				audioElement.classList.remove("audio-playing");
				audioElement.classList.add("audio-pause");
				thisElement.setAttribute('aria-label', 'Pause audio');
				audioElement.play();
				audioElement.addEventListener("timeupdate", function() {
				var formatted_curTime = "" + fmtMSS(audioElement.currentTime) + "";
				var curTime = formatted_curTime.slice(0, 4);
				var currentTimeEl = document.querySelector("#currTime" + playerId)
				currentTimeEl.innerHTML = curTime;
			
				var seekTime = parseInt(audioElement.currentTime, 10);
				var seekPerc = parseInt(seekTime) / parseInt(audioElement.duration, 10) * 100;
				document.querySelector("#seek" + playerId).querySelector(".audio-seek-dot").style.width = "" + seekPerc + "%";
			
				if (audioElement.currentTime == audioElement.duration) {
					document.querySelector("#seek" + playerId).querySelector(".audio-seek-dot").style.width = "0";
					document.querySelector(".audio-playing[data-id='"+ playerId +"']").classList.remove("audio-pause");
					document.querySelector(".audio-playing[data-id='"+ playerId +"']").classList.add("audio-playing");
				}
				});
			} else {
				audioElement.classList.remove("audio-pause");
				audioElement.classList.add("audio-playing");
				thisElement.setAttribute('aria-label', 'Play audio');
				audioElement.pause();
			}
		});

		audioSound.addEventListener("click", function(e) {
			var thisElement = e.target;
			var playerId = thisElement.getAttribute("data-id");
			var audioElement = document.querySelector("#player" + playerId);

			if (thisElement.classList.contains("unmute")) {
				thisElement.classList.remove("unmute");
				thisElement.classList.add("mute");
				thisElement.setAttribute('aria-label', 'Unute audio');
				audioElement.muted = true;
			} else {
				thisElement.classList.add("unmute");
				thisElement.classList.remove("mute");
				thisElement.setAttribute('aria-label', 'Mute audio');
				audioElement.muted = false;
			}
		});
	}

};

uk.ready(function() {
	main.init();
});
