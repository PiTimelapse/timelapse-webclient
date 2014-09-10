tlCtrls.controller('MainController', ["$scope", "Socket", function ($scope, Socket) {
    var toast = document.querySelector("#toast");
    $scope.notification = {
        message: "",
        type: ""
    };
    var init = function () {
        $scope.currentTimelapse = null;
        $scope.tab = 0;
        $scope.tlTab = 0;
        $scope.tlDelay = 90;
        $scope.conf = {};
        $scope.config = {};
        $scope.preview = "";
        $scope.brightness = "";
        $scope.timelapses = [];
    };
    init();
    Socket.on('disconnect', function () {
        init();
        showError('Disconnected from the server');
    });
    Socket.on("timelapse:picture", function () {
        $scope.$apply(function () {
            $scope.currentTimelapse.photoNb++;
        });
    });
    Socket.on("timelapse:start", function () {
        $scope.currentTimelapse = {photoNb: 0};
        showError('Timelapse started');
    });
    Socket.on("timelapse:stop", function () {
        $scope.currentTimelapse = null;
        showError("Timelapse stopped");
    });
    Socket.on("init", function (data) {
        $scope.$apply(function () {
            $scope.config = data.camera.config;
            $scope.camera = data.camera.gphotoObject;
            $scope.conf = data.conf;
            $scope.timelapses = data.timelapses;
            $scope.currentTimelapse = data.currentTimelapse;
        });
    });
    Socket.on('camera', function (data) {
        $scope.$apply(function () {
            $scope.config = data.camera.config;
            $scope.camera = data.camera.gphotoObject;
        });
    });
    Socket.on('camera:config', function (options) {
        $scope.$apply(function () {
            $scope.config = options;
        });
    });
    // Weird but it seems that giving showError as callback stop the heartbeat
    Socket.on('camera:error', function (err) {
        showError(err);
    });
    Socket.on('fs:error', function (err) {
        showError(err);
    });
    Socket.on('tl:info', function (err) {
        showError(err);
    });
    var showError = function (err) {
        console.log(err);
        $scope.$apply(function () {
            $scope.notification.message = err;
        });
        toast.show();
    };
    $scope.propertyChange = function (prop) {
        console.log($scope.config[prop].label + " changed to " + $scope.config[prop].value);
        Socket.emit("camera:changeprop", {prop: prop, value: $scope.config[prop].choices[$scope.config[prop].value]});
    };
    $scope.takePicture = function () {
        Socket.emit('camera:takepicture');
    };
    $scope.startTimelapse = function () {
        Socket.emit('timelapse:start', {delay: $scope.tlDelay});
    };
    $scope.stopTimelapse = function () {
        Socket.emit('timelapse:stop');
    }
}]);
