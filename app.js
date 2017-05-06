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

// обрабатывает запрос на первый экран
app.get("/", function(req, res) {
    res.render("page1");
});

// обрабатывает запрос на второй экран
app.get("/results", function(req, res) {
    let query = req.query.search; // значение поискового запроса
    query = query.replace(/\s{1,}/gi, '+'); // чтобы передать текст запроса из нескольких слов, меняем все пробелы на '+'
    
    // параметры для запроса данных, передаем в youtube.search.list
    let queryOptions = {
        'part': 'snippet',
        'maxResults': '20',
        'order': 'date',
        'relevanceLanguage': 'ru',  // предпочтительны запросы на русском, (можно удалить)
        'q': query,
        'type': 'video'
    };

    // получаем 20 (максимум) новых видеороликов
    youtube.search.list(queryOptions, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        // массив данных (найденные ролики и информация о просмотрах)
        let newData = [];

        // получить id видеороликов через запятую
        let concotanateID = (function() {
            let arr = [];
            for (let i = 0; i < data.items.length; i++) {
                arr.push(data.items[i].id.videoId);
            }
            return arr.join(',');
        })();

        // получить данные по количеству просмотров
        youtube.videos.list({
            part: 'statistics',
            id: concotanateID //concatenate ID
        }, function(err, data1) {
            if (err) {
                console.error(err);
                return;
            }

            // объединим массивы данных с найденными видео и по количеству просмотров
            for (let i = 0; i < data.items.length; i++) {
                newData[i] = {
                    search: data.items[i],
                    statistics: data1.items[i].statistics
                };
            }
            
            // сортировка полученных значений по количеству просмотров от большего к меньшему
            newData.sort(function(a, b) {
                return parseFloat(b.statistics.viewCount) - parseFloat(a.statistics.viewCount);
            });
            
            console.log(query);
            query = query.replace(/\+{1,}/gi, ' '); // чтобы вывести на экран текст запроса без плюсов
            console.log(query);
            
            // вывод данных на экран
            res.render("page2", {
                query: query,
                data: newData
            });
        });

    });

});


app.listen(PORT, () => console.log("Server has started!"));
