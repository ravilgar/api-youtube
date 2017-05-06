'use strict';

const express = require('express');
const app = express();
// const request = require("request");
const google = require('googleapis');

const PORT = process.env.PORT || 3000;


const API_KEY = 'AIzaSyBi1HziXDXX9l74Z0Vptx2jM1wRUB1wW8g';
const youtube = google.youtube({
    version: 'v3',
    auth: API_KEY
});



app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/css'));


app.get("/", function(req, res) {
    res.render("page1");
});

app.get("/results", function(req, res) {
    let query = req.query.search;
    let queryOptions = {
        'part': 'snippet',
        'maxResults': '20',
        'order': 'date',
        // 'order': 'viewCount',
        'q': query,
        'type': 'video'
    };


    youtube.search.list(queryOptions, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        // массив данных
        let newData = [];

        console.log(data.items[0]);
        // console.log(data);

        // получить массив видео по id
        let concotanateID = (function() {
            let arr = [];
            for (let i = 0; i < data.items.length; i++) {
                arr.push(data.items[i].id.videoId);
            }
            return arr.join(',');
        })();
        console.log(concotanateID);

        // получить данные по количеству просмотров
        youtube.videos.list({
            part: 'statistics',
            id: concotanateID //concatenate ID
        }, function(err, data1) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data1.items[0].statistics.viewCount);
            // console.log(data);

            // объединим массивы данных
            for (let i = 0; i < data.items.length; i++) {
                newData[i] = {
                    search: data.items[i],
                    statistics: data1.items[i].statistics
                };
            }
            console.log(newData[0]);
            newData.sort(function(a, b) {
                return parseFloat(b.statistics.viewCount) - parseFloat(a.statistics.viewCount);
            });

            res.render("page2", {
                query: query,
                data: newData
            });
        });


    });





});


app.listen(PORT, () => console.log("Server has started!"));
