const ContentItem = class {
  constructor (json, type) {
    this.json = json
    this.type = type
  }

  contentsList () {
    // Implement in subclasses
    return []
  }

  format () {
    return this.json.format
  }

  url () {
    return `https://gov.uk${this.json.base_path}`
  }

  description () {
    return this.json.description
  }

  title () {
    return this.json.title
  }

  manualTitle () {
    return this.json.links.manual ? this.json.links.manual[0].title : this.title()
  }

  context () {
    return this.json.navigation_document_supertype
  }

  sections () {
    return [
      { header: this.header() },
      { meta: this.meta() },
      { body: this.body() }
    ]
  }

  header () {
    return {
      context: this.context(),
      title: this.title(),
      description: this.description()
    }
  }

  meta () {
    return {
      translations: this.json.links.available_translations.map(t => { return t.locale }).join(', '),
      image: this.json.details.image ? this.json.details.image.url : 'No image',
      'withdrawal notice': this.json.withdrawn_notice.explanation ? this.withdrawn_notice.explanation : 'Not withdrawn',
      'history notice': (this.json.details.political && !this.json.details.government.current) ? 'Published under former government' : 'No history notice',
      metadata: this.metadata()
    }
  }

  metadata () {
    let fromLinkKeys = [
      'organisations',
      'worldwide_organisations',
      'ministers',
      'speaker'
    ]
    let partOfLinkKeys = [
      'document_collections',
      'related_policies',
      'policies',
      'world_locations',
      'topics',
      'topical_events',
      'related_statistical_data_sets'
    ]

    let fromLinks = this.mapLinkTitles(fromLinkKeys)
    let partOfLinks = this.mapLinkTitles(partOfLinkKeys)

    let firstPublished = new Date(this.json.first_published_at).toUTCString().split(' ').slice(0, 4).join(' ')
    let lastUpdated = new Date(this.json.public_updated_at).toUTCString().split(' ').slice(0, 4).join(' ')

    let from = fromLinks
    let partOf = partOfLinks

    return [
      { 'From': from },
      { 'Part of': partOf },
      { 'First published': firstPublished },
      { 'Last updated': lastUpdated }
    ]
  }

  body () {
    return { govspeak: this.json.details.body }
  }

  mapLinkTitles (keys) {
    let titles = keys.filter(key => {
      return this.json.links[key]
    }).map(key => {
      return this.json.links[key].map(link => { return link.title }).join(', ')
    }).join(', ')

    return titles
  }
}

module.exports = ContentItem
