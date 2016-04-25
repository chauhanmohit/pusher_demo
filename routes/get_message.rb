#!/usr/bin/env ruby

#getMessage route
get '/getMessage' do
  @node_info = Nodes.order("created_at DESC")
  @conn_info = Connections.order("created_at DESC")
  erb :'templates/message_listing'
  
end