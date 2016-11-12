app.controller("ctrl", function ($scope, $timeout) {
    $scope.sttlist = [];
    $scope.ttslist = [];

    $scope.status = {};
    $scope.status.stt = false;

    var recognizing = false;

    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

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
            if ($scope.status.wait > 15000)
                stt.stop();
        }

        $timeout();
    }, 1000);

    recognition.onstart = function () {
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

        if (finalized) {
            $scope.transcript = '';
            $scope.final_transcript = final_transcript;
            $scope.sttlist.push($scope.final_transcript);
            stt.stop();
        } else {
            $scope.transcript = transcript;
        }

        $timeout();
    };

    $scope.tts = function () {
        $.get("/api/sample", function (data) {
            $scope.ttslist.push(data.data);
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