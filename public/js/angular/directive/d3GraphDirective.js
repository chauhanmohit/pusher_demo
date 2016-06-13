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
                                if (type == 'node') {
                                    d3.select(this)
                                        .attr("x", d3.event.x)
                                        .attr("y", d3.event.y);
                                }
                            })
                            .on('dragend', function() {
                                var type = d3.select(this).attr('type') ;
                                var level = d3.select(this).attr('level');
                                var id = d3.select(this).attr('id');
                                var x = d3.select(this).attr('x');
                                var y = d3.select(this).attr('y');
                   
                                 // get collectively text and circle class and info
                                var text_element = d3.selectAll('text').filter('.text_name_'+id);
                                var collectiveData = {
                                    "ID" : id,
                                    "Name" : text_element.text()
                                }
                                if (type == 'node') {
                                    d3.selectAll("svg .connectionLine").remove();
                                    d3.selectAll('text').filter('.text_name_'+id).remove();
                                    d3.selectAll('circle').filter('.circle_'+id).remove();
                                    createConnections();
                                    createDataCircle(x, y, collectiveData);
                                }
                                
                                var changeData = {}; 
                                if(x < 130){
                                    changeData.Level = 1;
                                }else if (x < 320 && x > 130) {
                                    changeData.Level = 2;
                                }else if (x > 320 && x < 510) {
                                    changeData.Level = 3;
                                }else if(x > 510 && x < 730){
                                    changeData.Level = 4;
                                }else {
                                    changeData.Level = 'out of level';
                                }
                                changeData.Id = d3.select(this).attr('id');
                                changeData.xAxis = x;
                                changeData.yAxis = y;
                                
                                scope.$emit('level', changeData);
                            });
                                    
                        try {
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
                                                c.to = r.To;
                                                links.push({
                                                    "from": r.From,
                                                    "to": r.To ,
                                                    "level" : l.Level ,
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
                        } catch(e) {
                            alert("Sorry for inconvience Exception raised while creating graph.");
                            return false ;
                        }
                        
                        nodes.forEach(function(d,i){
                            
                            var rootName = d.children[0].Name ? d.children[0].Name : 'Not defined';
                            var k = parseInt(i + 1);
                    
                            if(k <= parseInt(nodes.length -1) ){                
                                svgContainer.append("line")
                                .attr("stroke", "black")
                                .attr("class","topLevelLine")
                                .attr({
                                    x1: parseInt( (rwidth + 70)*k ), y1: parseInt(rheight + 345), //start of the line
                                    x2: parseInt(  (rwidth + 70)*k ), y2: 0 //end of the line
                                });
                            }
                            
                            //appending nodes
                            _.map(d.children,function(value,index){
                                if (nodes.length === k) {
                                    svgContainer.append("rect")
                                        .attr("x", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) : 10 + (3*i*70) )
                                        .attr("y", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) : parseFloat(10 + parseInt( (150*( 0 ))/1.5 )) )
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
                                        .attr('x', !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 10 : 12 + (3*i*70)+ 10 )
                                        .attr('y', !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(12 + parseInt( (150*( 0 ))/1.5 ) + 35) )
                                        .attr('class', "text_name_"+value.ID)
                                        .attr('type','text')
                                        .attr('width', parseInt(rwidth) )
                                        .attr('height', parseInt(rheight) )
                                        .text(value.Name);
                                   
                                    //appending circles to the child node at the start of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) : 10 + (3*i*70) )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(10 + parseInt( (150*( 0 ))/1.5 ) + 37) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                
                                    //appending circles to the child node at the end of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 120 : 10 + (3*i*70) + rwidth )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(10 + parseInt( (150*( 0 ))/1.5 ) + 37) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                        
                                    //appending circles to the child node at the top of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 60 : (3*i*70) + rwidth - 50 )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) : parseFloat(10 + parseInt( (150*( 0 ))/1.5 )) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                        
                                    //appending circles to the child node at the bottom of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 60 : (3*i*70) + rwidth - 50 )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 75 : parseFloat(10 + parseInt( (150*( 0 ))/1.5 ) + 75) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                }else{
                                    svgContainer.append("rect")
                                        .attr("x", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) : 10 + (3*i*70) )
                                        .attr("y", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) : parseFloat(10 + parseInt( (150*( index ))/1.5 )) )
                                        .attr("rx",5)
                                        .attr("ry",5)
                                        .attr("id", value.ID)
                                        .attr("type","node")
                                        .attr("level", d.Level)
                                        .attr("width", rwidth)
                                        .attr("height", rheight)
                                        .style("stroke", "#000")
                                        .style("fill","#f2f2f2")
                                        .attr("cursor", "move")
                                        .call(drag)
                                        .style("stroke-width", 2);
                                    
                                    //appending names in the rectangle of child nodes
                                    svgContainer.append('text')
                                        .attr('x', !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 10 : 12 + (3*i*70)+ 10 )
                                        .attr('y', !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(12 + parseInt( (150*(index))/1.5 ) + 35) )
                                        .attr('class', "text_name_"+value.ID)
                                        .attr('type','text')
                                        .attr('width', parseInt(rwidth) )
                                        .attr('height', parseInt(rheight) )
                                        .text(value.Name);
                                   
                                    //appending circles to the child node at the start of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) : 10 + (3*i*70) )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(10 + parseInt( (150*(index ))/1.5 ) + 37) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                
                                    //appending circles to the child node at the end of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 120 : 10 + (3*i*70) + rwidth )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 37 : parseFloat(10 + parseInt( (150*(index ))/1.5 ) + 37) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                        
                                    //appending circles to the child node at the top of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 60 : (3*i*70) + rwidth - 50 )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) : parseFloat(10 + parseInt( (150*(index ))/1.5 )) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                        
                                    //appending circles to the child node at the bottom of rectangle
                                    svgContainer.append("circle")
                                        .attr("cx", !_.isUndefined(value.xAxis) ? parseFloat(value.xAxis) + 60 : (3*i*70) + rwidth - 50 )
                                        .attr("cy", !_.isUndefined(value.yAxis) ? parseFloat(value.yAxis) + 75 : parseFloat(10 + parseInt( (150*(index ))/1.5 ) + 75) )
                                        .attr("type", "circle")
                                        .attr("class","circle_"+value.ID)
                                        .attr("r",4)
                                        .style("fill","#3c753b");
                                }
                            });
                        });
                        
                        function createConnections() {
                            var k = 0 ;
                            _.map(connections,function(conn, i){
                                k = parseInt(i + 1 ) ;
                                if (conn.link.length) {
                                    if (k == conn.Level ) {
                                        _.map(conn.link, function(linklist, list){
                                            
                                            var positionx1 = document.getElementById(linklist.from).getAttribute('x') ;
                                            var positiony1 = document.getElementById(linklist.from).getAttribute('y') ;
                                            var positionx2 = document.getElementById(linklist.to).getAttribute('x') ;
                                            var positiony2 = document.getElementById(linklist.to).getAttribute('y') ;
                                            
                                            var fromLevel = document.getElementById(linklist.from).getAttribute('level');
                                            var toLevel = document.getElementById(linklist.to).getAttribute('level');
                                            if (parseInt(fromLevel) === parseInt(toLevel)) {
                                                svgContainer.append("line")
                                                .attr("class", "connectionLine")
                                                .attr('x1Node', linklist.from)
                                                .attr('x2Node', linklist.to)
                                                .attr({
                                                    x1: parseFloat(parseFloat(positionx1) + parseInt(rwidth/2)), y1: parseFloat(parseFloat(positiony1) + parseInt(rheight)), //start of the line
                                                    x2: parseFloat( parseFloat(positionx2) + parseInt(rwidth/2) ) , y2: parseFloat( parseFloat(positiony2)) //end of the line
                                                }); 
                                            }else if(fromLevel > toLevel){
                                                svgContainer.append("line")
                                                .attr("class", "connectionLine")
                                                .attr('x1Node', linklist.from)
                                                .attr('x2Node', linklist.to)
                                                .attr({
                                                    x1: parseFloat(positionx1), y1: calculatePositionY1( positiony1 , conn.Level, linklist.child), //start of the line
                                                    x2: parseFloat( parseFloat(positionx2) + parseInt(rwidth)), y2: calculatePositionY2( positiony2 , conn.Level, linklist.child) //end of the line
                                                });
                                            }else{
                                                svgContainer.append("line")
                                                .attr("class", "connectionLine")
                                                .attr('x1Node', linklist.from)
                                                .attr('x2Node', linklist.to)
                                                .attr({
                                                    x1: calculatePostionX1( positionx1 , conn.Level, linklist.child), y1: calculatePositionY1( positiony1 , conn.Level, linklist.child), //start of the line
                                                    x2: calculatePositionX2( positionx2 , conn.Level , linklist.child), y2: calculatePositionY2( positiony2 , conn.Level, linklist.child) //end of the line
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        
                        function createDataCircle(x,y,data) {
                            //appending names in the rectangle of child nodes
                            svgContainer.append('text')
                                .attr('x', parseFloat(x) + 15 )
                                .attr('y', parseFloat(y) + 35)
                                .attr('class', "text_name_"+data.ID)
                                .attr('type','text')
                                .attr('width', parseInt(rwidth) )
                                .attr('height', parseInt(rheight) )
                                .text(data.Name);
                                
                            //appending circles to the child node at the start of rectangle
                            svgContainer.append("circle")
                                .attr("cx", x)
                                .attr("cy", parseFloat(y) + 35)
                                .attr("type", "circle")
                                .attr("class","circle_"+data.ID)
                                .attr("r",4)
                                .style("fill","#3c753b");
        
                            //appending circles to the child node at the end of rectangle
                            svgContainer.append("circle")
                                .attr("cx", parseFloat(parseFloat(x) + 120))
                                .attr("cy", parseFloat(y) + 37)
                                .attr("type", "circle")
                                .attr("class","circle_"+data.ID)
                                .attr("r",4)
                                .style("fill","#3c753b");
                                
                            //appending circles to the child node at the top of rectangle
                            svgContainer.append("circle")
                                .attr("cx", parseFloat(parseFloat(x) + 60))
                                .attr("cy", parseFloat(y))
                                .attr("type", "circle")
                                .attr("class","circle_"+data.ID)
                                .attr("r",4)
                                .style("fill","#3c753b");
                                
                            //appending circles to the child node at the bottom of rectangle
                            svgContainer.append("circle")
                                .attr("cx", parseFloat(parseFloat(x) + 60))
                                .attr("cy", parseFloat(y) + 75)
                                .attr("type", "circle")
                                .attr("class","circle_"+data.ID)
                                .attr("r",4)
                                .style("fill","#3c753b");
                                
                            
                        }
                        
                        createConnections();
                        function calculatePostionX1(x , level, childCount) {
                            switch ( parseInt(level) ) {
                                case 1 :
                                    return parseInt(parseInt(x) + parseInt(rwidth) ) ;
                                break;
                                case 2 :
                                    return parseInt(parseInt(x) + parseInt(rwidth) ) ;
                                break;
                                case 3 :
                                    return parseInt(parseInt(x) + parseInt(rwidth) ) ;
                                default :
                                    return parseInt(parseInt(x) + parseInt(rwidth) ) ;
                                break;
                            }
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
                                    return parseInt(parseInt(y) + 37) ;
                                break;
                            }
                        }
                        
                        function calculatePositionX2(x , level, childCount) {
                            switch ( parseInt(level) ) {
                                case 1 :
                                    return parseInt(x) ;
                                break;
                                case 2 :
                                    return parseInt(x) ;
                                break;
                                case 3 :
                                    return parseInt(x) ;
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
                                    return parseInt(parseInt(y) + 37) ;
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
                        if (n !== o) {
                            scope.render(scope.data);    
                        }
                    });

                });
            }
        }
    }
}());