/** HB – Your team. Our agency. (HubSpot landing page)
 *
 * Behaviour ported from the uk-hb.com theme (scripts.js, scripts-template-home.js, scripts-template-in-housing.js)
 * plus the page's own bits. Needs jQuery, TweenMax, ScrollMagic and animation.gsap (loaded before this file).
--------------------------------------------------------------------------------- */

jQuery(function($){

	var $html = $('html');
	var $body = $('body');
	var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$html.removeClass('no-js').addClass(canHover ? 'no-touch' : 'touch');


	// ----- Footer year
	// ---------------------------------------------

		$('.lp-js-year').text(new Date().getFullYear());


	// ----- Hero: M()RE logo
	// M()RE fades in closed up, opens out to show the image, then IN-HOUSING and the strapline
	// fade in around it. The content below is there from the start.
	// ---------------------------------------------

		function fnHeroShow(animate){
			var logo = $('.lp-more');
			if(!animate){
				logo.addClass('jsMoreNoAnim jsMoreIn jsMoreOpen jsMoreText');
				$('body').addClass('jsHeroDone');
				return;
			}
			setTimeout(function(){ logo.addClass('jsMoreIn'); }, 200);    // M()RE fades in (700ms)
			setTimeout(function(){ logo.addClass('jsMoreOpen'); }, 1100);  // Opens out (1100ms)
			setTimeout(function(){ logo.addClass('jsMoreText'); }, 2200);  // IN-HOUSING, then the strapline
			setTimeout(function(){ $('body').addClass('jsHeroDone'); }, 3000); // Marks the end (nothing waits on it now)
		}
		// Play it unless the page opens on a section further down (e.g. a link to #contact),
		// where nobody would see it. #top or no hash = play.
		var openTarget = window.location.hash.length > 1 ? $(document.getElementById(window.location.hash.slice(1))) : $();
		var opensBelowHero = openTarget.length && openTarget.offset().top > $('.lp-hero').outerHeight() / 2;
		fnHeroShow( !opensBelowHero && !reduceMotion );


	// ----- In-page links: smooth scroll, without adding #section to the address
	// (so refreshing always starts at the top with the hero animation)
	// ---------------------------------------------

		$(document).on('click', 'a[href^="#"]', function(e){
			var id = this.getAttribute('href').slice(1);
			var target = id ? document.getElementById(id) : null;
			if(!target) return;
			e.preventDefault();
			// Land with the section's divider line just below the fixed header
			var section = $(target).closest('section, .lp-zone');
			if(!section.length) section = $(target);
			// Ignore the fade-in's temporary 2rem nudge (sections not yet faded in sit lower than they will)
			var nudge = new DOMMatrix(getComputedStyle(section[0]).transform === 'none' ? undefined : getComputedStyle(section[0]).transform).m42;
			var top = id === 'top' ? 0 : section.offset().top - nudge - $('#mainHeader').outerHeight() - 20;
			window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
			if(window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
		});


	// ----- Jump to section
	// ---------------------------------------------

		var $jumpToggle = $('.lp-jump__toggle');
		var $jumpMenu = $('#lpJumpMenu');

		function fnJumpClose(returnFocus){
			$jumpMenu.attr('hidden', '');
			$jumpToggle.attr('aria-expanded', 'false');
			if(returnFocus) $jumpToggle[0].focus();
		}

		$jumpToggle.on('click', function(e){
			e.preventDefault();
			if($jumpToggle.attr('aria-expanded') === 'true'){
				fnJumpClose(false);
			} else {
				$jumpMenu.removeAttr('hidden');
				$jumpToggle.attr('aria-expanded', 'true');
			}
		});
		$jumpMenu.on('click', 'a', function(){ fnJumpClose(false); });
		$(document).on('click', function(e){
			if(!$(e.target).closest('.lp-jump').length) fnJumpClose(false);
		});
		$(document).on('keydown', function(e){
			if(e.key === 'Escape' && $jumpToggle.attr('aria-expanded') === 'true') fnJumpClose(true);
		});


	// ----- Accordions (Our work + Questions): one open at a time
	// ---------------------------------------------

		function fnAccordion(listSelector, toggleSelector, panelSelector){
			$(listSelector).on('click', toggleSelector, function(e){
				e.preventDefault();
				var item = $(this).closest('li');
				var isOpen = item.hasClass('is-open');

				// Videos only play while their panel is open
				item.find('video').each(function(){
					if(isOpen){ this.pause(); }
					else { var v = this; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
				});

				// Toggle this one
				$(this).attr('aria-expanded', isOpen ? 'false' : 'true');
				var panel = item.find(panelSelector);
				if(isOpen){
					panel.stop().slideUp(300, function(){
						item.removeClass('is-open');
						panel.css('display', '');
					});
				} else {
					item.addClass('is-open');
					var display = panel.css('display'); // grid on desktop, block on mobile
					panel.hide().css('display', display).hide().stop().slideDown(300, function(){
						panel.css('display', '');
					});
				}
			});
		}
		fnAccordion('.lp-worklist', '.lp-worklist__toggle', '.lp-worklist__panel');
		fnAccordion('.lp-faqlist', '.lp-faqlist__toggle', '.lp-faqlist__panel');


	// ----- Cursor tooltip ("Open" / "Close" on the Our work and Questions rows)
	// ---------------------------------------------

		if(canHover && $('[data-tooltip]').length){
			var $tip = $('<div class="lp-cursortip" aria-hidden="true"><span></span></div>').appendTo('body');
			var fnTipText = function(toggle){
				$tip.find('span').text(toggle.attr('aria-expanded') === 'true' ? 'Close' : 'Open');
			};
			$(document).on('mousemove', '[data-tooltip]', function(e){
				fnTipText($(this));
				$tip.addClass('is-visible').css('transform', 'translate(' + (e.clientX + 18) + 'px, ' + (e.clientY + 2) + 'px)'); // Sits just right of the cursor
			});
			// Swap the label straight away when a row is opened or closed (the accordion runs first)
			$(document).on('click', '[data-tooltip]', function(){
				var toggle = $(this);
				setTimeout(function(){ fnTipText(toggle); }, 0);
			});
			$(document).on('mouseleave', '[data-tooltip]', function(){
				$tip.removeClass('is-visible');
			});
		}


	// ----- Client logos: duplicate each row so it can loop
	// ---------------------------------------------

		$('.lp-logos__track').each(function(){
			var track = $(this);
			track.children().clone().attr('aria-hidden', 'true').find('img').attr('alt', '').end().appendTo(track);
			track.addClass('jsMarquee');
		});


	// ----- HubSpot form (fill in data-portal-id and data-form-id on .hb-hsform)
	// ---------------------------------------------

		$('.hb-hsform').each(function(i){
			var formElem = $(this);
			var portalId = formElem.data('portal-id');
			var formId = formElem.data('form-id');
			if(!portalId || !formId || !window.hbspt) return;

			var id = 'hb-hsform-' + i;
			formElem.attr('id', id).empty();

			window.hbspt.forms.create({
				region: formElem.data('region') || 'eu1',
				portalId: String(portalId),
				formId: String(formId),
				target: '#' + id,
				css: '' // HubSpot's default styles off: components/_hubspot-form.scss styles it
			});
		});


	// ----- Inline video (theme)
	// ---------------------------------------------

		$('.inlineVideoPlay').on('click', function(e){
			e.preventDefault();
			var videoContainer = $(this).parents('.inlineVideo');
			videoContainer.addClass('jsVideoActive');
			setTimeout(function(){ videoContainer.addClass('jsVideoPlaying'); }, 750);
		});


	// ----- ScrollMagic (from the theme)
	// ---------------------------------------------

		if(typeof ScrollMagic === 'undefined') return;

		var ScrollMagicController = new ScrollMagic.Controller();

		// Sticky menu once scrolled
		new ScrollMagic.Scene({
			triggerElement: '#mainGrid',
			triggerHook: 0,
			offset: 20
		})
		.setClassToggle('body', 'jsStickyMenu')
		.addTo(ScrollMagicController);

		// Footer colour change when the slogan comes into view
		new ScrollMagic.Scene({
			triggerElement: '#triggerFooterToggle',
			triggerHook: 1.0,
			offset: 0
		})
		.setClassToggle('.mainFooter', 'jsFooterScrolled')
		.addTo(ScrollMagicController);

		// Whole-page background colour change while a .bgToggle passes the middle of the screen
		$('.bgToggle').each(function(){
			var elem = $(this);
			var hook = parseFloat(elem.attr('data-trigger')) || 0.5; // Must be a number: ScrollMagic ignores "1" as text
			// data-end: where on screen the next section's divider line has to reach
			// before the colour changes back. Defaults to the same point as the start.
			var endHook = isNaN(parseFloat(elem.attr('data-end'))) ? hook : parseFloat(elem.attr('data-end'));
			var scene = new ScrollMagic.Scene({
				triggerElement: this,
				duration: function(){ // Re-measured on resize
					if(elem.attr('data-end') === 'none') return 0; // 0 = stays on until you scroll back above it
					// With data-end, measure to the next section's divider line rather than the zone's edge
					var nextLine = elem.attr('data-end') ? elem.closest('.lp-zone').nextAll('section').first().find('.section_header') : $();
					var length = nextLine.length ? nextLine.offset().top - elem.offset().top : elem.outerHeight();
					return length + (hook - endHook) * $(window).height();
				},
				triggerHook: hook,
				offset: parseFloat(elem.attr('data-offset')) || 0
			})
			.setClassToggle('body', 'jsBgToggle')
			.addTo(ScrollMagicController);
		});

		// Fade sections in when they reach 85% of the way down the screen.
		// .lpFadeWithLine: fades in with its section's divider line (titles), not when it reaches 85% itself
		$('.animateFadeIn').each(function(){
			var line = $(this).hasClass('lpFadeWithLine') ? $(this).closest('section').find('.section_header')[0] : null;
			// data-fade-with="selector": fade in at the same moment as that element in the same section
			if($(this).attr('data-fade-with')) line = $(this).closest('section').find($(this).attr('data-fade-with'))[0] || null;
			new ScrollMagic.Scene({
				triggerElement: line || this,
				triggerHook: 0.85, // 85% down the screen
				offset: 0
			})
			.setClassToggle(this, 'jsFadeIn')
			.addTo(ScrollMagicController);
		});

		// Autoplay <video> while in view
		$('.autoplayVideoInViewport').each(function(){
			var videoElem = $(this).find('video')[0];
			if(!videoElem) return;
			if($(videoElem).attr('preload') === 'none'){
				videoElem.load();
				videoElem.pause();
			}
			new ScrollMagic.Scene({
				triggerElement: this,
				duration: function(){ return $(videoElem).height() + $(window).height(); },
				triggerHook: 1.0
			})
			.on('enter', function(){ var p = videoElem.play(); if(p && p.catch) p.catch(function(){}); })
			.on('leave', function(){ videoElem.pause(); })
			.addTo(ScrollMagicController);
		});

				// Parallax images (ScrollMagic + TweenMax, as on the Home template).
		// Each image travels from below to above its Figma position while it crosses the screen, so the
		// composition lines up when it's mid-screen. data-speed sets the depth: 1 = 15% of the screen height
		// either way; small images are faster, big ones slower.
		if(!reduceMotion && typeof TweenMax !== 'undefined'){
			$('.parallaxImage').each(function(){
				var elem = $(this);
				var img = elem.find('img');
				var speed = parseFloat(elem.attr('data-speed')) || 1;
				// Travel follows the layout (which is sized in vw), capped by the window height,
				// so tall/narrow screens don't throw images further than the composition allows
				var range = function(){ return Math.round(speed * 0.15 * Math.min($(window).height(), $(window).width() * 0.5625)); };

				var scene = new ScrollMagic.Scene({
					triggerElement: this,
					duration: function(){ return $(window).height() + elem.outerHeight(true); },
					triggerHook: 1.0
				})
				.setTween(TweenMax.fromTo(img, 1, { y: range() }, { y: -range(), ease: Linear.easeNone }))
				.addTo(ScrollMagicController);

				// Re-measure the travel if the window height changes
				$(window).on('resize', function(){
					scene.setTween(TweenMax.fromTo(img, 1, { y: range() }, { y: -range(), ease: Linear.easeNone }));
				});
			});
		}
});
