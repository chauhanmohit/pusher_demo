#!/usr/bin/env ruby

#post send routes
post '/send' do
 
  pusher_client = Pusher::Client.new(
    app_id: '197384',
    key: 'a9779a8ea251d99d1d7a',
    secret: '0ad9f780bddf93773fb9',
    encrypted: true
  )
 
  message_fields = Hash.new('message_fields')
  message_fields = {
    "email" => params['email'],
    "from" => params['from'],
    "to" => params['to'],
    "title" => params['title'],
    "message" => params['body']
  }
  
  record = Records.new()
  record.email = params['email']
  record.from = params['from']
  record.to = params['to']
  record.title = params['title']
  record.message = params['body']
  
  if record.save
    pusher_client.trigger('test_channel', 'my_event', message_fields)
    redirect '/showGraph'
  else
    raise "Error occured while saving record"
    pust "Error occured while saving record"
  end
end