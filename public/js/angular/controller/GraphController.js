(function(){
    'use strict'
    app.controller('graphController', controllerMethod);
    
    controllerMethod.$inject = ['$http','$scope','toastr','_'];
    
    function controllerMethod($http, $scope, toastr,_) {
        $scope.serverData = [] ;
        
        $http.get('js/data/data.json')
        .then(function(result){
            $scope.serverData.push(result.data);
            $scope.textareaData = JSON.stringify(result.data);
        },function(error){
            console.log("Error Raised", error);
        });
                    
        var pusher = new Pusher('a9779a8ea251d99d1d7a', {
            encrypted: true
        });
        
        var channel = pusher.subscribe('test_channel');
        
        channel.bind('my_event', function(data) {
            toastr.success("Data recieved from the server !",'Alert!');
            if (data.type == 'node') {
                $scope.serverData[0].Components.push({
                    "ID" : parseInt(data.nodeId) ,
                    "Name" : data.nodeName,
                    "Level" : parseInt(data.nodeLevel)
                });
            }else{
                $scope.serverData[0].Connections.push({
                    "From" : parseInt(data.connectionFrom) ,
                    "To" : parseInt(data.connectionTo)
                });
            }
        });
        
        $scope.loadtextData = function(){
            $scope.serverData = [] ;
            setTimeout(function(){
                $scope.serverData.push(JSON.parse($scope.textareaData));
                $scope.$apply();
            },2000);
        }
    }
    
}());