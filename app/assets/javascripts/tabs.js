/* eslint-env jquery */

/* tab navigation and content show/hide */
$('ul.tab--nav li a').click(function () {
  const target = '#' + $(this).data('target')
  $('ul.tab--nav li a').removeClass('active')
  $(this).addClass('active')
  $('.tab--content').not(target).addClass('js-hidden')
  $(target).removeClass('js-hidden')
})

/* grey tab navigation and content show/hide */
$('ul.tab--nav-grey li a').click(function () {
  const target = '#' + $(this).data('target')
  $('ul.tab--nav-grey li a').removeClass('active')
  $(this).addClass('active')
  $('.tab--content').not(target).addClass('js-hidden')
  $(target).removeClass('js-hidden')
})
