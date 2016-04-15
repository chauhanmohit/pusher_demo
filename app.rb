#!/usr/bin/env ruby

require 'rubygems'

# Setting up environments
require 'dotenv' unless ENV['RACK_ENV'] == 'production'

# System
require 'sinatra'
require 'pusher'

# Setting up databases/helpres/libs
require_relative 'models/init'
require_relative 'routes/init'

