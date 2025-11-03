"use client";
import React from "react";
import { Plane, Zap, Globe, Radio, AlertCircle, Server } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <Plane className="w-24 h-24 text-blue-300" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Aero Echo
          </h1>

          <p className="text-lg md:text-xl text-blue-200 max-w-2xl">
            Track live aircraft movements in real-time with advanced flights
            tracking technology
          </p>
          <Link href="/map">
            <button className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:cursor-pointer hover:scale-105">
              View Live Map
              <Globe className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Built With Modern Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-blue-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-6 border border-blue-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-8 h-8 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">ADSB.one API</h3>
            </div>
            <p className="text-blue-200 text-sm">
              Real-time aircraft data streaming with comprehensive flight
              information
            </p>
          </div>

          <div className="bg-blue-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-6 border border-blue-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Socket.IO</h3>
            </div>
            <p className="text-blue-200 text-sm">
              WebSocket technology for instant, bidirectional real-time updates
            </p>
          </div>

          <div className="bg-blue-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-6 border border-blue-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Next.js</h3>
            </div>
            <p className="text-blue-200 text-sm">
              React framework for optimized performance and seamless navigation
            </p>
          </div>

          <div className="bg-blue-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-6 border border-blue-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">
                Node.js + Express
              </h3>
            </div>
            <p className="text-blue-200 text-sm">
              Robust backend server handling data processing and API requests
            </p>
          </div>
        </div>
      </div>

      {/* API Restrictions Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-yellow-900 bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 border border-yellow-600 border-opacity-40">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4 text-yellow-300">
                API Usage Guidelines
              </h3>
              <div className="space-y-3 text-blue-100">
                <p className="leading-relaxed">
                  This application uses the ADSB.one API, which provides free
                  access to real-time aircraft tracking data. Please note the
                  following technical constraints:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Coverage Radius:</strong>{" "}
                      Limited to 250 nautical miles from a specific location
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Rate Limiting:</strong>{" "}
                      Maximum 1 request per second to the API
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Data Caching:</strong>{" "}
                      Server-side global variable caching is implemented to
                      optimize performance and respect rate limits
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      <strong className="text-white">Smart Filtering:</strong>{" "}
                      Flight data is filtered based on map zoom level and
                      boundaries to provide relevant information efficiently
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 pb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-cyan-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Real-Time Tracking
            </h3>
            <p className="text-blue-200">
              Watch aircraft positions update instantly with WebSocket
              connections
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Global Coverage
            </h3>
            <p className="text-blue-200">
              Track flights worldwide with extensive ADS-B network coverage
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
              <Radio className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Live Data</h3>
            <p className="text-blue-200">
              Access comprehensive flight details including altitude, speed, and
              heading
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
