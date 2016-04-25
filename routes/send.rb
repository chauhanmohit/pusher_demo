#!/usr/bin/env ruby

#post send routes
post '/send_node' do
 
  pusher_client = Pusher::Client.new(
    app_id: '197384',
    key: 'a9779a8ea251d99d1d7a',
    secret: '0ad9f780bddf93773fb9',
    encrypted: true
  )
 
  message_fields = Hash.new('message_fields')
  message_fields = {
    "nodeId" => params['id'],
    "nodeName" => params['name'],
    "nodeLevel" => params['level'],
    "type" => "node"
  }
  
  record = Nodes.new()
  record.nodeid = params['id']
  record.name = params['name']
  record.level = params['level']
  
  if record.save
    pusher_client.trigger('test_channel', 'my_event', message_fields)
    redirect '/getMessage'
  else
    raise "Error occured while saving record"
    pust "Error occured while saving record"
  end
end

#post request send_connections
post '/send_connections' do
  pusher_client = Pusher::Client.new(
    app_id: '197384',
    key: 'a9779a8ea251d99d1d7a',
    secret: '0ad9f780bddf93773fb9',
    encrypted: true
  )
 
  message_fields = Hash.new('message_fields')
  message_fields = {
    "connectionFrom" => params['from'],
    "connectionTo" => params['to'],
    "type" => "connection"
    
  }
  
  record = Connections.new()
  record.from = params['from']
  record.to = params['to']
  
  if record.save
    pusher_client.trigger('test_channel', 'my_event', message_fields)
    redirect '/getMessage'
  else
    raise "Error occured while saving record"
    pust "Error occured while saving record"
  end
end