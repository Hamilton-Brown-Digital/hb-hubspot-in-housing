/* HB Creative – In-Housing landing page */
(function ($) {
  'use strict';

  var HB = {
    init: function () {
      this.year();
      this.smoothScroll();
      this.headerOnScroll();
      this.hubspotForm();
    },

    // Footer year
    year: function () {
      $('.hb-js-year').text(new Date().getFullYear());
    },

    // Smooth scroll for in-page links
    smoothScroll: function () {
      $(document).on('click', '.hb-js-scroll', function (e) {
        var target = $(this.getAttribute('href'));
        if (!target.length) return;
        e.preventDefault();
        var offset = $('.hb-header').outerHeight() || 0;
        $('html, body').animate({ scrollTop: target.offset().top - offset }, 500);
      });
    },

    // Add a class to the header once the page scrolls
    headerOnScroll: function () {
      var $header = $('.hb-header');
      var toggle = function () {
        $header.toggleClass('is-scrolled', $(window).scrollTop() > 10);
      };
      $(window).on('scroll', toggle);
      toggle();
    },

    // Render HubSpot forms from data attributes on .hb-hsform
    hubspotForm: function () {
      $('.hb-hsform').each(function (i) {
        var $el = $(this);
        var portalId = $el.data('portal-id');
        var formId = $el.data('form-id');
        if (!portalId || !formId || !window.hbspt) return;

        var id = 'hb-hsform-' + i;
        $el.attr('id', id).empty();

        window.hbspt.forms.create({
          region: $el.data('region') || 'eu1',
          portalId: String(portalId),
          formId: String(formId),
          target: '#' + id,
          css: '' // drop HubSpot's default styles; ours live in _form.scss
        });
      });
    }
  };

  $(function () { HB.init(); });
})(jQuery);
