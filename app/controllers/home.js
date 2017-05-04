module.exports = {
  list (req, res) {
    return res.status(200).render('home', { fomats: [] })
  }
}
