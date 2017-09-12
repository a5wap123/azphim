import { fetchUrl } from "fetch"
import { StrRemoveIndex } from '../../ultis/ulti'

var ex = module.exports
const baseUri = 'http://www.phimmoi.net/'
const arrayUri = [
    { key: 'chieurap', uri: 'phim-chieu-rap/' },
    { key: 'le', uri: 'phim-le/' },
    { key: 'bo', uri: 'phim-bo/' },
    { key: 'hoathinh', uri: 'the-loai/phim-hoat-hinh/' },
    { key: 'search', uri: 'tim-kiem/' }
]
import cio from 'cheerio'
import { findObjectByKey } from '../../ultis/ulti'


getString = async (url) => {
    return new Promise(function (resolve, reject) {
        try {
            fetchUrl(url, (error, meta, body) => {
                resolve(body.toString())
            })
        } catch (error) {
            reject(error);
        }
    });
}
ex.getPhim = async () => {
    let arrIdUl = [
        'movie-last-theater',
        'movie-last-movie',
        'movie-last-series',
        'movie-last-cartoon']
    const body = await getString(baseUri)
    let $ = cio.load(body)
    let content = {}
    var lst = []
    var lstDeCu = []
    let lis = $('ul#movie-carousel-top').find('li')
    for (var index = 0; index < lis.length; index++) {
        let p = {}
        p.title = lis.eq(index).find('a').attr('title')
        p.url = lis.eq(index).find('a').attr('href')
        let style = lis.eq(index).find('a > div').attr('style')
        let regex = /http:.*jpg/gim
        let matches = regex.exec(style)
        p.img = matches
        lstDeCu.push(p)
    }
    lst.push(lstDeCu)
    for (var i = 0; i < arrIdUl.length; i++) {
        var lstChieuRap = []
        let id = `ul#${arrIdUl[i]}`
        lis = $(id).find('li')
        for (var index = 0; index < lis.length; index++) {
            let p = {}
            p.title = lis.eq(index).find('a').attr('title')
            p.url = lis.eq(index).find('a').attr('href')
            let style = lis.eq(index).find('a  div.ratio-content').attr('style')
            let regex = /http:.*jpg/gim
            let matches = regex.exec(style)
            p.img = matches
            lstChieuRap.push(p)
        }
        lst.push(lstChieuRap)
    }
    tab = getTabMovies(body)
    content.lstP = lst
    content.tabMovies = tab
    return content
}

getTabMovies = (body) => {
    let $ = cio.load(body)
    let divTabMovies = $('div#tabs-movie');
    let ul = divTabMovies.find('ul.tab-content')
    lstUl = []

    for (var i = 0; i < ul.length; i++) {
        let id = `ul#tabs-${i + 1}`
        let lis = divTabMovies.find(id).find('li')
        lstP = []
        for (var index = 0; index < 5; index++) {
            let p = {}
            p.titleVN = lis.eq(index).find('a div.meta').find('span.name-vn').text()
            p.titleEN = lis.eq(index).find('a div.meta').find('span.name-en').text()
            p.eps = lis.eq(index).find('div.eps').text()
            p.url = lis.eq(index).find('a').attr('href')
            let style = lis.eq(index).find('a  div.thumbn').attr('style')
            let regex = /http:.*jpg/gim
            let matches = regex.exec(style)
            p.img = matches
            lstP.push(p)
        }
        lstUl.push(lstP)
    }
    return lstUl
}

ex.getDetalFilm = async (url) => {
    url = baseUri + url
    const body = await getString(url)
    let $ = cio.load(body)
    let detail = {}
    var divContain = $('div.movie-info')
    detail.tag = getIdOnString(url)
    detail.domain = baseUri
    detail.urlFilm = url
    detail.nameVN = divContain.find('h1.movie-title > span.title-1').text()
    detail.nameEN = divContain.find('h1.movie-title > span.title-2').text()
    detail.imgCover = divContain.find('div.movie-l-img > img').attr('src')
    detail.contentFilm = divContain.find('div#film-content').html()

    let director = {}
    let aDiretor = divContain.find('a.director')
    let name = aDiretor.text()
    if (name != '') {
        director.Url = aDiretor.attr('href')
        director.Name = name
        director.tag = getIdOnString(director.Url)
    }

    let country = {}
    country.Url = divContain.find('dd.dd-country > a.country').attr('href')
    country.Name = divContain.find('dd.dd-country > a.country').text()
    let arrSplit = country.Url.split('/')
    country.tag = arrSplit[arrSplit.length - 2]
    detail.director = director
    detail.country = country
    
    let lstcat = divContain.find('dd.dd-cat a.category')
    let cats = []
    for (var i = 0; i < lstcat.length; i++) {
        let element = lstcat.eq(i)
        let cat = {}
        cat.url = element.attr('href')
        cat.title = element.text()
        cats.push(cat)
    }
    detail.cats = cats

    let urlXemPhim = divContain.find('a#btn-film-watch').attr('href')
    detail.servers = await getEpisode(urlXemPhim)
    return detail

}
getEpisode = async (url) => {
    url = baseUri + url
    const body = await getString(url)
    let $ = cio.load(body)
    let servers = []
    let lstServer = $('div.list-server').find('div.server')
    for (var i = 0; i < lstServer.length; i++) {
        var element = lstServer.eq(i);
        let server = {}
        server.name = element.find('h3').text().replace(/\n/gim, ' ')
        var lstEpisode = []
        let lis = element.find('li')
        for (var index = 0; index < lis.length; index++) {
            let p = {}
            p.title = lis.eq(index).find('a').text().trim()
            p.url = lis.eq(index).find('a').attr('href')
            p.episodeid = lis.eq(index).find('a').attr('data-episodeid')
            lstEpisode.push(p)
        }
        server.episodes = lstEpisode
        servers.push(server)
    }



    return servers
}
ex.getLinkPlay = async (url) => {
    url = baseUri + url
    let body = await getString(url)
    let $ = cio.load(body)
    let script = $('script[rel=nofllow]').attr('src')
    let res = await getString(script)
    let regex = /{"requestId".*}/gim
    let _responseJson = regex.exec(res)

    let responseJson = JSON.parse(_responseJson)
    responseJson.previewThumb = getPreviewUrl(body)
    return responseJson
}

ex.getListMovies = async (key, page, text) => {
    let a = findObjectByKey(arrayUri, 'key', key)
    let url = a.uri
    if (key === 'search')
        url = `${url}${text}/`
    else
        url = `${url}page-${page}.html`
    url = baseUri + url
    console.log(url)
    let body = await getString(url)
    let $ = cio.load(body)
    let lis = $('ul.list-movie').find('li')
    let lst = []
    for (var index = 0; index < lis.length; index++) {
        let p = {}
        let el = lis.eq(index)
        let style = el.find('a div.movie-thumbnail').attr('style')
        let regex = /http:.*jpg/gim
        let matches = regex.exec(style)
        p.img = matches[0]
        p.nameVN = el.find('a  span.movie-title-1').text()
        p.nameEN = el.find('a  span.movie-title-2').text()
        p.esp = el.find('a  span.movie-title-chap').text()
        p.url = el.find('a').attr('href')
        lst.push(p)
    }
    return lst
}

getPreviewUrl = (body) => {
    let $ = cio.load(body)
    let filmInfoScript = $('div.col-lg-8 > script').html()
    let regex = /previewUrl='.*'/gim
    let previewUrl = regex.exec(filmInfoScript)
    let urlImg = ''
    if (previewUrl != undefined) {
        urlImg = previewUrl[0].replace(/previewUrl='/gim, '')
        urlImg = urlImg.replace(/'/gim, '')
    }

    console.log(urlImg)

}

getIdOnString = (str) => {
    let regex = /-\d+\//gim
    let match = regex.exec(str)
    if (match != undefined) {
        let tag = match[0]
        tag = StrRemoveIndex(tag, 1)
        tag = StrRemoveIndex(tag, tag.length)
        return tag
    }
    return null
}