#!/usr/bin/env ruby
require 'sinatra/activerecord'
require './config/environments' #database configuration
require 'pathname'

uri      = Pathname.new( __FILE__ )
folder   = uri.dirname
category = folder.basename.to_s.capitalize

# load all uploaders, models and migrations (uploaders should be loaded first)
Pathname.glob( "#{uri.dirname}/*.rb" ).each do |file|
  path = file.relative_path_from( folder )
  puts "(**) #{category} initialization, loading #{path}"
  require_relative file
end