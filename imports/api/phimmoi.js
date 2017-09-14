import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
export const Films = new Mongo.Collection('film')
export const Director = new Mongo.Collection('director')
export const Country = new Mongo.Collection('country')
export const Category = new Mongo.Collection('category')
export const Episodes = new Mongo.Collection('episodes')
export const Servers = new Mongo.Collection('servers')
export const Historys = new Mongo.Collection('history')


if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('films', function FilmsPublication() {
        return Films.find();
    });
    Meteor.publish('directors', function FilmsPublication() {
        return Director.find();
    });
    Meteor.publish('countrys', function FilmsPublication() {
        return Country.find();
    });
    Meteor.publish('categorys', function FilmsPublication() {
        return Category.find();
    });
    Meteor.publish('episodes', function FilmsPublication() {
        return Episodes.find();
    });
    Meteor.publish('servers', function FilmsPublication() {
        return Servers.find();
    });
}
Meteor.methods({
    'films.insert'(detail) {
        let rowFilm = Films.findOne({ 'tag': detail.tag })
        let cats = []
        for (var i = 0; i < detail.cats.length; i++) {
            var cat = detail.cats[i];
            cats.push(cat.url)
        }
        if (!rowFilm) {
            Films.insert({
                'tag':detail.tag, 'domain':detail.domain, 
                'urlFilm':detail.urlFilm,'imdb':detail.imdb,
                'nameVN':detail.nameVN, 'nameEN':detail.nameEN, 
                'imgCover':detail.imgCover, 'contentFilm':detail.contentFilm,
                'tagDirector':detail.director.tag,'tagCountry':detail.country.tag,
                'previewThumb':detail.previewThumb,'cats':cats,
                'createTime':new Date(),'dateTime':new Date()
            });
        }
        else{
            console.log('da ton tai')
        }

    },
    'director.insert'(director) {
        let rowDirector = Director.findOne({'tag':director.tag})
        if(!rowDirector){
            Director.insert({'tag':director.tag,'name':director.name,'url':director.url})
        }
    },
    'country.insert'(country) {
        let row = Country.findOne({'tag':country.tag})
        if(!row){
            Country.insert({'tag':country.tag,'name':country.name,'url':country.url})
        }
    },
    'category.insert'(cats){
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            let row = Category.findOne({'url':cat.url})
            if(!row){
                Category.insert({'url':cat.url,'name':cat.title})
            }
            
        }
    },
    'episodes.insert'(servers,tagFilm){
        for (let i = 0; i < servers.length; i++) {
            let server = servers[i]
            let rowServer = Servers.findOne({tagFilm,'name':server.name})
            if(!rowServer){
                Servers.insert({tagFilm,'name':server.name})
                rowServer = Servers.findOne({tagFilm,'name':server.name})
            }
            let idServer = rowServer._id
            let episodes = server.episodes
            for (let ie = 0; ie < episodes.length; ie++) {
                let episode = episodes[ie];
                let rowEpisode = Episodes.findOne({tagFilm,idServer,'tag':episode.episodeid})
                if(!rowEpisode){
                    Episodes.insert({tagFilm,'tag':episode.episodeid,idServer,'title':episode.title,'url':episode.url})
                }
            }    
        }
    },
    'history.insert'(url){

    }

});