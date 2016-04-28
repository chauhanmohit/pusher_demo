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
        
        $scope.changeText = function() {
            var id = $scope.id, name = $scope.name, element = $('.text_name_'+id );
            $scope.text = {};
            if (element !== undefined) {
                var element = $('.text_name_'+id ).text(name);
                $scope.id = '';
                $scope.name = '';
                _.map(JSON.parse($scope.textareaData) , function(value, key){
                    if (key == 'Components') {
                        _.map(value, function(components, index){
                            if (id == components.ID) {
                                components.Name = name ;
                            }
                        });
                    }
                    if (key == "Components") {
                        $scope.text.Components = value ;
                    }else{
                        $scope.text.Connections = value ;
                    }
                });
                $scope.textareaData = JSON.stringify($scope.text) ;
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }else{
              alert("error occured");
            }
        }
        
        $scope.$on('level', function(event, data){
            $scope.text = {};
            _.map(JSON.parse($scope.textareaData) , function(value, key){
                if (key == 'Components') {
                    _.map(value, function(components, index){
                        if (data.Id == components.ID) {
                            components.Level = data.Level ;
                        }
                    });
                }
                if (key == "Components") {
                    $scope.text.Components = value ;
                }else{
                    $scope.text.Connections = value ;
                }
            });
                $scope.textareaData = JSON.stringify($scope.text) ;
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
        });
    }
    
}());