$(document).ready(function() { //страница загрузилась	
    $('.title').click(function() { //при клике на название ролика
        $(this).parent().children('.player').slideToggle(200); // раскрываем div с видеороликом
    });

});
