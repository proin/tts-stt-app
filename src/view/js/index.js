app.controller("ctrl", function ($scope, $timeout) {
    $scope.sttlist = [];
    $scope.ttslist = [];

    $scope.time = {};

    $scope.status = {};
    $scope.status.stt = false;

    var MAX_WAITING_TIME = 5000;

    var recognizing = false;

    var recognition = new webkitSpeechRecognition();
    console.log(recognition);
    recognition.continuous = false;
    recognition.interimResults = true;
    // recognition.lang = 'ko-KR';
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 2;

    var stt = {};
    stt.start = function () {
        if (!recognizing) recognition.start();
    };

    stt.stop = function () {
        if (recognizing) {
            $scope.lastTime = new Date().getTime();
            recognition.stop();
        }
    };

    setInterval(function () {
        if ($scope.status.stt) {
            $scope.status.wait = new Date().getTime() - $scope.lastTime;
            if ($scope.status.wait > MAX_WAITING_TIME) {
                stt.stop();
            }
        }

        $timeout();
    }, 1000);

    recognition.onaudiostart = function (event) {
        $scope.lastTime = new Date().getTime();
    };

    recognition.onspeechstart = function (event) {
        $scope.lastTime = new Date().getTime();
    };

    recognition.onstart = function () {
        $scope.time.start = new Date();
        recognizing = true;
    };

    recognition.onend = function () {
        recognizing = false;

        $scope.final_transcript = '';
        $timeout();
        if ($scope.status.stt) stt.start();
    };

    recognition.onresult = function (event) {
        $scope.lastTime = new Date().getTime();
        var final_transcript = '';
        var transcript = '';
        var finalized = false;
        for (var i = event.resultIndex; i < event.results.length; ++i)
            if (event.results[i].isFinal) {
                finalized = true;
                final_transcript += event.results[i][0].transcript;
            } else {
                transcript += event.results[i][0].transcript;
            }

        $scope.time.end = new Date();

        if (finalized) {
            $scope.transcript = {};
            $scope.final_transcript = final_transcript;
            $scope.sttlist.unshift({time: {start: $scope.time.start.format('HH:mm:ss'), end: $scope.time.end.format('HH:mm:ss')}, text: $scope.final_transcript});
            stt.stop();
        } else {
            $scope.transcript = {time: {start: $scope.time.start.format('HH:mm:ss'), end: $scope.time.end.format('HH:mm:ss')}, text: transcript};
        }

        $timeout();
    };

    $scope.tts = function () {
        $.get("/api/sample", function (data) {
            $scope.ttslist.unshift(data.data);
            $timeout();
        });
    };

    $scope.stt = function () {
        if ($scope.status.stt) {
            stt.stop();
        } else {
            $scope.sttlist.splice(0, $scope.sttlist.length);
            $scope.ttslist.splice(0, $scope.ttslist.length);
            stt.start();
        }

        $scope.lastTime = new Date().getTime();

        $scope.status.stt = !$scope.status.stt;
        $timeout();
    };
});