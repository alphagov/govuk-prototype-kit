const express = require('express')
const router = express.Router()
const ohlasenieRouter = express.Router()

router.get('/', function (req, res) {
  res.render('zalozenie-zivnosti/index.html', buildRequestData(req))
})

router.get('/bankovy-ucet', function (req, res) {
  res.render('zalozenie-zivnosti/bankovy_ucet.html', buildRequestData(req))
})

// Ohlasenie
router.use('/ohlasenie', ohlasenieRouter)
ohlasenieRouter.get('/', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie.html', buildRequestData(req))
})

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
    return '/zalozenie-zivnosti' + '/' + path
  }

  return {
    'serviceName': 'Založenie živnosti: krok po kroku',
    'serviceUrl': '/zalozenie-zivnosti',
    'activeHref': request.baseUrl + request.path.slice(0, -2),
    'navigationSteps': [
      {
        number: '0',
        title: 'Úvod',
        description: 'Nepovinné, ale užitočné. Postačí vám aj bežný účet.',
        href: urlTo('')
      },
      {
        number: '1',
        title: 'Založte si bankový účet',
        description: 'Nepovinné, ale užitočné. Postačí vám aj bežný účet.',
        href: urlTo('bankovy-ucet')
      },
      {
        number: '2',
        title: 'Ohláste svoju živnosť',
        description: 'Zaregistrujte vašu živnosť a získajte IČO.',
        href: urlTo('ohlasenie')
      },
      {
        number: '3',
        title: 'Zaregistrujte sa na DPH',
        description: 'Ak budete pracovať pre zahraničných zákazníkov alebo obracať veľké peniaze.',
        href: 'dph',
        links: [
          {
            text: 'Zistite, či sa potrebujete zaregistrovať na DPH',
            href: '#'
          }
        ]
      },
      {
        number: '4',
        title: 'Dane a odvody: čo treba platiť',
        description: 'Kedy a či začať platiť zdravotné a sociálne poistenie.',
        links: [
          {
            text: 'Zistite, aké odvody musíte platiť',
            href: '#'
          },
          {
            text: 'Dôležité termíny pre platenie daní',
            href: '#'
          }
        ]
      }
    ]
  }
}

module.exports = router
