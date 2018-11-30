const express = require('express')
const router = express.Router()
const ohlasenieRouter = express.Router()

router.get('/', function (req, res) {
  res.render('zalozenie-zivnosti/index.html', buildRequestData(req))
})

router.get('/bankovy-ucet', function (req, res) {
  res.render('zalozenie-zivnosti/bankovy_ucet.html', buildRequestData(req))
})

router.get('/ohlasenie', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie.html', buildRequestData(req))
})

// Ohlasenie
router.use('/ohlasenie/?', ohlasenieRouter)
ohlasenieRouter.get('/start', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/osobne_udaje.html', buildRequestData(req))
})

ohlasenieRouter.get('/osobne-udaje', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/osobne_udaje.html', buildRequestData(req))
})

ohlasenieRouter.get('/adresa', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/adresa.html', buildRequestData(req))
})

ohlasenieRouter.get('/register-trestov', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/register_trestov.html', buildRequestData(req))
})

ohlasenieRouter.get('/adresa-ulica', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/adresa_ulica.html', buildRequestData(req))
})

ohlasenieRouter.get('/zdravotna-poistovna', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/zdravotka.html', buildRequestData(req))
})

ohlasenieRouter.get('/nazov', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/nazov.html', buildRequestData(req))
})

ohlasenieRouter.get('/cinnosti', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/cinnost.html', buildRequestData(req))
})

ohlasenieRouter.get('/zhrnutie', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie/zhrnutie.html', buildRequestData(req))
})

function buildRequestData (request) {
  function urlTo (path) {
    return '/zalozenie-zivnosti' + path
  }

  console.log(request.path, request.originalUrl, request.baseUrl + request.path)
  return {
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
