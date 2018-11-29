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
  res.render('zalozenie-zivnosti/ohlasenie_start.html', buildRequestData(req))
})

ohlasenieRouter.get('/adresa-psc', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie_adresa_psc.html', buildRequestData(req))
})

ohlasenieRouter.get('/adresa-ulica', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie_adresa_ulica.html', buildRequestData(req))
})

ohlasenieRouter.get('/zdravotna-poistovna', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie_zdravotka.html', buildRequestData(req))
})

ohlasenieRouter.get('/cinnost', function (req, res) {
  res.render('zalozenie-zivnosti/ohlasenie_cinnost.html', buildRequestData(req))
})

function buildRequestData (request) {
  function urlTo (path) {
    return request.baseUrl + '/' + path
  }

  return {
    'serviceName': 'Založenie živnosti: krok po kroku',
    'serviceUrl': '/zalozenie-zivnosti',
    'activeHref': request.baseUrl + request.url,
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
