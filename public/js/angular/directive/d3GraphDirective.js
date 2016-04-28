(function(){
    'use strict';
    
    app.directive('systemGraph',directiveMethod);
    
    directiveMethod.$inject = ['$http','_','d3Service'];
        
    function directiveMethod($http,_,d3Service) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            replace : true ,
            link : function(scope, element){
                d3Service.d3().then(function(d3) {
                    
                    scope.render = function(data){
                        d3.selectAll("svg").remove();
                        var nodes = [], connections = [] , links = [] ,rwidth = 120, rheight= 75, gap = 50, radius = 10 ;
                        
                        //Make an SVG Container
                        var svgContainer = d3.select('#chart').append("svg")
                                .classed("svg-container", true)
                                .attr("preserveAspectRatio", "xMinYMin meet")
                                .attr("viewBox", "-12 1 795 394")
                                .attr("viewBox", "0 0 795 394")
                                .classed("svg-content-responsive", true)
                                .append("g");
                                            
                        // capture drag event
                        var drag = d3.behavior.drag()
                                    .on('drag', function() {
                                        var type =  d3.select(this).attr('type') ;
                                        switch (type) {
                                            case 'node':
                                                d3.select(this)
                                                    .attr("x", d3.event.x)
                                                    .attr("y", d3.event.y);
                                                break;
                                            case 'text':
                                                d3.select(this)
                                                    .attr("x", d3.event.x)
                                                    .attr("y", d3.event.y);
                                                break;
                                            case 'circle':
                                                d3.select(this)
                                                    .attr("cx", d3.event.x)
                                                    .attr("cy", d3.event.y);
                                                break;
                                            default:
                                        }
                                        
                                    })
                                    .on('dragend', function() {
                                        var type = d3.select(this).attr('type') ;
                                        var parent = this.parentNode 
                                        switch (type) {
                                            case 'node':
                                                console.log("this", this);
                                                d3.selectAll("svg line").remove();
                                                createConnections();
                                                break;
                                            case 'text':
                                                console.log("text is draged to parent", parent);
                                                break;
                                            default:
                                        }
                                        console.log("this", d3.select(this).node().parentNode);
                                    });
                                    
                        
                        data.forEach(function(d,i){
                            nodes = _.chain(d.Components)
                                .groupBy("Level")
                                .pairs()
                                .map(function (currentItem) {
                                    return _.object(_.zip(["Level", "children"], currentItem));
                                })
                                .value();
                                
                            //creating the links between nodes
                            _.map(nodes,function(l,i){
                                l.Id = l.children[0].ID ; 
                                _.map(l.children,function(c,child){
                                    _.map(d.Connections,function(r,conn){
                                        if (c.ID === r.From) {
                                            c.from = r.From ;
                                            c.to = r.To
                                            links.push({
                                                "from": r.From,
                                                "to": r.To ,
                                                "level" : parseInt(l.Level) ,
                                                "child" : l.children.length
                                            }); 
                                        }
                                    });
                                });
                            });
                            
                            //console.log("links", links);
                            connections = _.chain(links)
                                .groupBy("level")
                                .pairs()
                                .map(function (currentItem) {
                                    return _.object(_.zip(["Level", "link"], currentItem));
                                })
                                .value();
                        });
                        
                        nodes.forEach(function(d,i){
                            var rootName = d.children[0].Name ? d.children[0].Name : 'Not defined';
                            var k = parseInt(i + 1);
                
                                if(k <= parseInt(nodes.length -1) ){                
                                    svgContainer.append("line")
                                        .attr("stroke", "black")
                                        .attr({
                                            x1: parseInt( (rwidth + 70)*k ), y1: parseInt(rheight + 345), //start of the line
                                            x2: parseInt(  (rwidth + 70)*k ), y2: 0 //end of the line
                                        });
                                }
                                
                                //appending nodes      
                                _.map(d.children,function(value,index){
                                    svgContainer.append("rect")
                                        .attr("x", 10 + (3*i*70))
                                        .attr("y", 10 + parseInt( (150*(index ))/1.5 ))
                                        .attr("rx",5)
                                        .attr("ry",5)
                                        .attr("id", value.ID)
                                        .attr("type","node")
                                        .attr("level", d.Level)
                                        .attr("width", rwidth)
                                        .attr("height", rheight)
                                        .style("stroke", "#000")
                                        .style("fill","none")
                                        .attr("cursor", "move")
                                        .call(drag)
                                        .style("stroke-width", 2);
                
                                    //appending names in the rectangle of child nodes
                                    svgContainer.append('text')
                                        .attr('x', 12 + (3*i*70)+ 10 )
                                        .attr('y', 12 + parseInt( (150*(index))/1.5 ) + 35)
                                        .attr('class', "text_name_"+value.ID)
                                        .attr('type','text')
                                        .attr('width', parseInt(rwidth) )
                                        .attr('height', parseInt(rheight) )
                                        .text(value.Name)
                                        .attr('cursor', 'move')
                                        .call(drag);
                                            
                                    //appending circles to the child node at the start of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", 10 + (3*i*70))
                                        .attr("cy", 10 + parseInt( (150*(index ))/1.5 ) + 37 )
                                        .attr("type", "circle")
                                        .attr("r",4)
                                        .style("fill","#3c753b")
                                        .attr('cursor', 'move')
                                        .call(drag);
                
                                    //appending circles to the child node at the end of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", 10 + (3*i*70) + rwidth )
                                        .attr("cy", 10 + parseInt( (150*(index ))/1.5 ) + 37 )
                                        .attr("type", "circle")
                                        .attr("r",4)
                                        .style("fill","#3c753b")
                                        .attr('cursor', 'move')
                                        .call(drag);;
                                });
                        });
                        
                        function createConnections() {
                            var k = 0 ;
                            _.map(connections,function(conn, i){
                                k = parseInt(i + 1 ) ;
                                if (conn.link.length) {
                                    if (k == parseInt(conn.Level) ) {
                                        _.map(conn.link, function(linklist, list){
                                            var positionx1 = document.getElementById(linklist.from).getAttribute('x') ;
                                            var positiony1 = document.getElementById(linklist.from).getAttribute('y') ;
                                            var positionx2 = document.getElementById(linklist.to).getAttribute('x') ;
                                            var positiony2 = document.getElementById(linklist.to).getAttribute('y') ;
                                            svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr('x1Node', linklist.from)
                                            .attr('x2Node', linklist.to)
                                            .attr({
                                                x1: calculatePostionX1( positionx1 , conn.Level, linklist.child), y1: calculatePositionY1( positiony1 , conn.Level, linklist.child), //start of the line
                                                x2: calculatePositionX2( positionx2 , conn.Level , linklist.child), y2: calculatePositionY2( positiony2 , conn.Level, linklist.child) //end of the line
                                            }); 
                                        });
                                    }
                                }
                            });
                        }
                        
                        createConnections();
                        function calculatePostionX1(x , level, childCount) {
                            switch ( parseInt(level) ) {
                                case 1 :
                                    return parseInt(parseInt(x) + parseInt(rwidth) ) ;
                                break;
                                case 2 :
                                    return parseInt( parseInt(x) + parseInt(rwidth) );
                                break;
                                case 3 :
                                    return parseInt( parseInt(x) + parseInt(rwidth) );
                                default :
                                    return parseInt(x) ;
                                break;
                            }
                            //return x ;
                        }
                        
                        function calculatePositionY1( y , level, childCount) {
                            switch ( parseInt(level) ) {
                                case 1 :
                                    return parseInt(parseInt(y) + 37) ;
                                break;
                                case 2 :
                                    return parseInt(parseInt(y) + 37) ;
                                break;
                                case 3 :
                                    return parseInt(parseInt(y) + 37) ;
                                break ;
                                default :
                                    return parseInt(y) ;
                                break;
                            }
                        }
                        
                        function calculatePositionX2(x , level, childCount) {
                                switch ( parseInt(level) ) {
                                    case 1 :
                                        return parseInt(x) ;
                                    break;
                                    case 2 :
                                        return parseInt( x );
                                    break;
                                    case 3 :
                                        return parseInt( x );
                                    default :
                                        return parseInt(x) ;
                                    break;
                                }
                        }
                        
                        function calculatePositionY2(y , level, childCount) {
                            switch ( parseInt(level) ) {
                                case 1 :
                                    return parseInt(parseInt(y) + 37) ;
                                break;
                                case 2 :
                                    return parseInt(parseInt(y) + 37) ;
                                break;
                                case 3 :
                                    return parseInt(parseInt(y) + 37) ;
                                break ;
                                default :
                                    return parseInt(y) ;
                                break;
                            }
                        }
                       
                    }// scope.render method closed from here......
                    
                    scope.$watchCollection('data[0].Components', function(n,o){
                        if (n) {
                            scope.render(scope.data);    
                        }
                    });
                    
                    scope.$watchCollection('data[0].Connections', function(n,o){
                        if (n) {
                            scope.render(scope.data);    
                        }
                    });
                    
                    scope.$watchCollection('data',function(n,o){
                        if (n) {
                            scope.render(scope.data);    
                        }
                    });

                });
            }
        }
    }
    
}());