tlServices.factory('Socket', [function () {
    if (!io) {
        console.log("Missing socket.io.js file");
        return;
    }
    return io.connect(window.socketIOServer);
}]);
