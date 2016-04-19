(function(){
    'use strict'
    app.controller('graphController', controllerMethod);
    
    controllerMethod.$inject = ['$http','$scope','toastr'];
    
    function controllerMethod($http, $scope, toastr) {
        $scope.serverData = [] ;
        
        $http.get('js/data/data.json')
        .then(function(result){
            $scope.serverData.push(result.data);
        },function(error){
            console.log("Error Raised", error);
        });
                    
        var pusher = new Pusher('a9779a8ea251d99d1d7a', {
            encrypted: true
        });
        
        var channel = pusher.subscribe('test_channel');
        
        channel.bind('my_event', function(data) {
            toastr.success("Data recieved from the server !",'Alert!');
            $scope.serverData[0].Components.push({
                "ID" : data.nodeId ,
                "Name" : data.nodeName,
                "Level" : data.nodeLevel
            });
            $scope.serverData[0].Connections.push({
                "From" : data.connectionFrom ,
                "To" : data.connectionTo
            });
        });
    }
    
}());