(function(){
    'use strict'
    app.controller('graphController', controllerMethod);
    
    controllerMethod.$inject = ['$http','$scope','toastr'];
    
    function controllerMethod($http, $scope, toastr) {
        $scope.serverData = [] ;
        var pusher = new Pusher('a9779a8ea251d99d1d7a', {
            encrypted: true
        });
        
        var channel = pusher.subscribe('test_channel');
        
        channel.bind('my_event', function(data) {
            toastr.success("Data recieved from the server !",'Alert!');
            $scope.serverData.push(data);
        });
    }
    
}());