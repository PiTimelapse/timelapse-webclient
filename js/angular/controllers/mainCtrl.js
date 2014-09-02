tlCtrls.controller('MainController', ["$scope", "Socket", function ($scope, Socket) {
    var toast = document.querySelector("#toast");
    $scope.notification = {
        message: "",
        type: ""
    };
    $scope.cameras = [];
    $scope.selectedCamera = null;
    $scope.tab = 0;
    $scope.tlDelay = 90;
    $scope.conf = {};
    $scope.preview = "";
    $scope.brightness = "";
    $scope.props = {
        aperture: {
            values: [3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22],
            value: 3.5
        },
        shutterspeed: {
            values: ["1/1000", "1/800", "1/100", "1/80", "1/30", "1/15", "1/10", "1/6", "1", "1.2", "1.3", "2", "3", "15", "30", "M"],
            value: 1
        },
        iso: {
            values: ["AUTO", "100", "200", "400", "800", "1600", "3200", "6400"],
            value: 3
        }
    };
    Socket.on("init", function (data) {
        $scope.$apply(function () {
            $scope.cameras = data.cameras;
            $scope.preview = data.previewLocation;
            $scope.conf = data.conf;
        });
    });
    Socket.on('camera:remove', function (data) {
        var index = findByPort(data.camera, $scope.cameras);
        if (index === $scope.selectedCamera) {
            $scope.$apply(function () {
                $scope.selectedCamera = null;
                $scope.notification.message = "The camera your were working on was disconected";
            });
            toast.show();
        }
        $scope.$apply(function () {
            $scope.cameras.splice(index, 1);
        });
    });
    Socket.on('camera:add', function (data) {
        $scope.$apply(function () {
            $scope.cameras.push(data.camera);
        });
    });
    Socket.on('camera:config', function (options) {
        $scope.$apply(function () {
            $scope.props = options;
        });
    });
    Socket.on('camera:error', function (err) {
        $scope.$apply(function () {
            $scope.notification.message = err;
        });
        toast.show();
    });
    Socket.on("picture:preview", function (options) {
        console.log(options);
        $scope.$apply(function () {
            $scope.preview = options.location;
            $scope.brightness = options.meanBrightness;
        });
    });
    $scope.propertyChange = function (prop) {
        console.log($scope.props[prop].label + " changed to " + $scope.props[prop].value);
        Socket.emit("camera:changeprop", {prop: prop, value: $scope.props[prop].choices[$scope.props[prop].value]});
    };
    $scope.selectCamera = function (index) {
        $scope.selectedCamera = index;
        Socket.emit('camera:select', {camera: $scope.cameras[index]});
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

function findByPort (needle, stack) {
    for (var i = 0, len = stack.length; i < len; i += 1) {
        if (needle.port === stack[i].port) {
            return i;
        }
    }
    return -1;
}
