/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
<!--[if lt IE 8]><!-->
<script src="ie7/ie7.js"></script>
<!--<![endif]-->
*/

(function () {
  function addIcon (el, entity) {
    const html = el.innerHTML
    el.innerHTML = '<span style="font-family: \'hod\'">' + entity + '</span>' + html
  }
  const icons = {
    'hod-home': '&#xe900;',
    'hod-search': '&#xf002;',
    'hod-search-plus': '&#xf00e;',
    'hod-search-minus': '&#xf010;',
    'hod-cog': '&#xf013;',
    'hod-gear': '&#xf013;',
    'hod-pencil': '&#xf040;',
    'hod-map-marker': '&#xf041;',
    'hod-chevron-left': '&#xf053;',
    'hod-chevron-right': '&#xf054;',
    'hod-info-circle': '&#xf05a;',
    'hod-comment': '&#xf075;',
    'hod-chevron-up': '&#xf077;',
    'hod-chevron-down': '&#xf078;',
    'hod-phone': '&#xf095;',
    'hod-file': '&#xf15b;',
    'hod-trash': '&#xf1f8;',
    'hod-image': '&#xe90d;',
    'hod-film': '&#xe913;',
    'hod-file-empty': '&#xe924;',
    'hod-clock': '&#xe94e;',
    'hod-calendar': '&#xe953;',
    'hod-printer': '&#xe954;',
    'hod-mobile': '&#xe958;',
    'hod-key': '&#xe98d;',
    'hod-airplane': '&#xe9af;',
    'hod-link': '&#xe9cb;',
    'hod-warning': '&#xea07;',
    'hod-plus': '&#xea0a;',
    'hod-minus': '&#xea0b;',
    'hod-cross': '&#xea0f;',
    'hod-checkmark': '&#xea10;',
    'hod-arrow-up': '&#xea32;',
    'hod-arrow-right': '&#xea34;',
    'hod-arrow-down': '&#xea36;',
    'hod-arrow-left': '&#xea38;',
    'hod-embed2': '&#xea80;',
    'hod-github': '&#xeab0;',
    0: 0
  }
  const els = document.getElementsByTagName('*')
  let i; let c; let el
  for (i = 0; ; i += 1) {
    el = els[i]
    if (!el) {
      break
    }
    c = el.className
    c = c.match(/hod-[^\s'"]+/)
    if (c && icons[c[0]]) {
      addIcon(el, icons[c[0]])
    }
  }
}())
