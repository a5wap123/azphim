import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
export const Films = new Mongo.Collection('film');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('films', function FilmsPublication() {
        return Films.find();
    });
}
Meteor.methods({
    'films.insert'(tag, domain, urlFilm, nameVN, nameEN, imgCover, contentFilm) {
        let row = Films.findOne({ 'tag': tag })
        if (!row) {
            Films.insert({
                tag, domain, urlFilm, nameVN, nameEN, imgCover, contentFilm
            });
        }
        else{
            console.log('da ton tai')
        }

    },
    'films.remove'(taskId) {
        check(taskId, String);

        Films.remove(taskId);
    }
});