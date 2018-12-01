const { check, validationResult } = require('express-validator/check')

const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
  res.render('zalozenie-zivnosti/index.html', buildRequestData(req))
})

router.get('/bankovy-ucet', function (req, res) {
  res.render('zalozenie-zivnosti/bankovy_ucet.html', buildRequestData(req))
})

router.get('/ohlasenie', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie.html', buildRequestData(req))
})

router.get('/dph', function (req, res) {
  res.render('zalozenie-zivnosti/dph.html', buildRequestData(req))
})

// Ohlasenie
router.get('/ohlasenie/osobne-udaje', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/osobne_udaje.html', buildRequestData(req))
})

router.post('/ohlasenie/osobne-udaje', [
  check('first-name').isAlpha('sk-SK'),
  check('surname').isAlpha('sk-SK'),
  check('birth-number').isNumeric(),
  check('email').isEmail()
], function (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/osobne_udaje.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/adresa')
})

router.get('/ohlasenie/adresa', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/adresa.html', buildRequestData(req))
})

router.post('/ohlasenie/adresa', [
  check('street').not().isEmpty(),
  check('street-number').isNumeric(),
  check('town').not().isEmpty(),
  check('zip-code').isNumeric()
], function (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/adresa.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/register-trestov')
})

router.get('/ohlasenie/register-trestov', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/register_trestov.html', buildRequestData(req))
})

router.post('/ohlasenie/register-trestov', [
  check('birthplace').not().isEmpty(),
  check('father-first-name').isAlpha('sk-SK'),
  check('father-surname').isAlpha('sk-SK'),
  check('mother-first-name').isAlpha('sk-SK'),
  check('mother-surname').isAlpha('sk-SK'),
  check('mother-maiden-surname').isAlpha('sk-SK')
], function (req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/register_trestov.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/zdravotna-poistovna')
})

router.get('/ohlasenie/adresa-ulica', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/adresa_ulica.html', buildRequestData(req))
})

router.get('/ohlasenie/zdravotna-poistovna', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/zdravotka.html', buildRequestData(req))
})

router.post('/ohlasenie/zdravotna-poistovna', [
  check('health-insurance').not().isEmpty()
], function (req, res) {
  console.log('here')
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/zdravotka.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/nazov')
})

router.get('/ohlasenie/nazov', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/nazov.html', buildRequestData(req))
})

router.post('/ohlasenie/nazov', [
  check('business-name').not().isEmpty()
], function (req, res) {
  console.log('here')
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/nazov.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/cinnosti')
})

router.get('/ohlasenie/cinnosti', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/cinnost.html', buildRequestData(req))
})

router.post('/ohlasenie/cinnosti', [
  check('activity').not().isEmpty()
], function (req, res) {
  console.log('here')
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('zalozenie-zivnosti/ohlasenie/cinnost.html', buildRequestData(req, errors))
  }
  return res.redirect('/zalozenie-zivnosti/ohlasenie/zhrnutie')
})

router.get('/ohlasenie/zhrnutie', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/zhrnutie.html', buildRequestData(req))
})

router.get('/ohlasenie/podpis', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/podpis.html', buildRequestData(req))
})

function mapErrorrs (errors) {
  console.log(errors)
  const errorsMap = {}
  for (const error of errors) {
    errorsMap[error.param] = { text: error.msg }
  }
  console.log(errorsMap)
  return errorsMap
}

function buildRequestData (request, errors) {
  function urlTo (path) {
    return '/zalozenie-zivnosti' + path
  }

  return {
    'errors': errors ? mapErrorrs(errors.array()) : null,
    'activeHref': urlTo(request.path),
    'serviceName': 'Založenie živnosti: krok po kroku',
    'serviceUrl': '/zalozenie-zivnosti',
    'navigationSteps': [
      {
        number: '0',
        title: 'Úvod',
        description: 'Nepovinné, ale užitočné. Postačí vám aj bežný účet.',
        href: urlTo('/'),
        isActive: request.path === '/'
      },
      {
        number: '1',
        title: 'Založte si bankový účet',
        description: 'Nepovinné, ale užitočné. Postačí vám aj bežný účet.',
        href: urlTo('/bankovy-ucet'),
        isActive: request.path === '/bankovy-ucet'
      },
      {
        number: '2',
        title: 'Ohláste svoju živnosť',
        description: 'Zaregistrujte vašu živnosť a získajte IČO.',
        href: urlTo('/ohlasenie'),
        isActive: request.path === '/ohlasenie'
      },
      {
        number: '3',
        title: 'Zaregistrujte sa na DPH',
        description: 'Ak budete pracovať pre zahraničných zákazníkov alebo obracať veľké peniaze.',
        href: urlTo('/dph'),
        isActive: request.path === '/dph'
      }
    ]
  }
}

module.exports = router
