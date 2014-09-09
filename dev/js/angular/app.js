// Get the socket server from the socket.io import
var s = document.querySelector("#socketScript");
window.socketIOServer = s.getAttribute('src').split("/socket.io/socket.io.js")[0];

var tlApp = angular.module('tl-app', ["tl-controllers", "tl-services", "ng-polymer-elements"]);
