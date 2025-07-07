#!/usr/bin/env node

// Main entry point for Hello World application
import process from "node:process";
const { greet } = require('./lib/greeter');

// Get name from command line arguments or use default
const name = process.argv[2] || 'World';

// Display greeting
console.log(greet(name));