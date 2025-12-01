'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';

// Component to fetch and display clutch data
function ClutchData() {
  const [clutches, setClutches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://p5f57pijb2.execute-api.us-east-1.amazonaws.com/clutches')
      .then(res => res.json())
      .then(data => {
        setClutches(data.clutches || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch clutches:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading clutch data...</div>;
  }

  return (
    <div className="space-y-2">
      {clutches.slice(0, 3).map((clutch, index) => (
        <div key={clutch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">Clutch #{index + 1}</div>
            <div className="text-xs text-gray-500">
              {new Date(clutch.uploadTimestamp).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{clutch.eggCount} eggs</div>
            <div className="text-xs text-gray-500">
              {clutch.viabilityPercentage ? `${clutch.viabilityPercentage.toFixed(1)}% viable` : 'Analyzing...'}
            </div>
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <span className="text-sm text-gray-500">Total: {clutches.length} clutches analyzed</span>
      </div>
    </div>
  );
}

// Component to fetch and display egg data
function EggData() {
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://p5f57pijb2.execute-api.us-east-1.amazonaws.com/api/eggs')
      .then(res => res.json())
      .then(data => {
        setEggs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch eggs:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading egg data...</div>;
  }

  return (
    <div className="space-y-2">
      {eggs.slice(0, 3).map((egg, index) => (
        <div key={egg.egg_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">Egg #{index + 1}</div>
            <div className="text-xs text-gray-500">
              {egg.metadata?.breed || 'Unknown breed'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{egg.status}</div>
            <div className="text-xs text-green-600">
              ⛓️ Blockchain certified
            </div>
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <span className="text-sm text-gray-500">Total: {eggs.length} eggs registered</span>
      </div>
    </div>
  );
}

// Component to fetch and display environmental data
function EnvironmentData() {
  const [environment, setEnvironment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnvironment = () => {
      fetch('https://p5f57pijb2.execute-api.us-east-1.amazonaws.com/api/environment/current')
        .then(res => res.json())
        .then(data => {
          setEnvironment(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch environment:', err);
          setLoading(false);
        });
    };

    fetchEnvironment();
    // Update every 5 seconds for real-time feel
    const interval = setInterval(fetchEnvironment, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading environment...</div>;
  }

  if (!environment) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-sm">Temperature</div>
          <div className="text-xs text-gray-500">Optimal range</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{parseFloat(environment.readings?.temperature || 0).toFixed(1)}°C</div>
          <div className="text-xs text-green-600">✓ Normal</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-sm">Humidity</div>
          <div className="text-xs text-gray-500">Moisture level</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{parseFloat(environment.readings?.humidity || 0).toFixed(1)}%</div>
          <div className="text-xs text-green-600">✓ Normal</div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium text-sm">Oxygen</div>
          <div className="text-xs text-gray-500">Air quality</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{parseFloat(environment.readings?.oxygen_level || 0).toFixed(1)}%</div>
          <div className="text-xs text-green-600">✓ Normal</div>
        </div>
      </div>

      <div className="text-center pt-2">
        <span className="text-sm text-gray-500">
          Updated: {environment.timestamp ? new Date(environment.timestamp).toLocaleTimeString() : 'Unknown'}
        </span>
      </div>
    </div>
  );
}

// Component to fetch and display blockchain status
function BlockchainStatus() {
  const [blockchain, setBlockchain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://p5f57pijb2.execute-api.us-east-1.amazonaws.com/api/blockchain/network-status')
      .then(res => res.json())
      .then(data => {
        setBlockchain(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blockchain status:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading blockchain status...</div>;
  }

  if (!blockchain) {
    return <div className="text-gray-500">No blockchain data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {blockchain.ethereum_network?.connected ? '✓' : '✗'}
        </div>
        <div className="text-sm font-medium">Ethereum Mainnet</div>
        <div className="text-xs text-gray-500">
          {blockchain.ethereum_network?.status || 'Unknown'}
        </div>
      </div>
      
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {blockchain.ethereum_network?.current_block || 'N/A'}
        </div>
        <div className="text-sm font-medium">Current Block</div>
        <div className="text-xs text-gray-500">Latest block height</div>
      </div>

      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {blockchain.ethereum_network?.gas_price_gwei || 'N/A'}
        </div>
        <div className="text-sm font-medium">Gas Price (Gwei)</div>
        <div className="text-xs text-gray-500">Network fee</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showImageUpload, setShowImageUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🥚</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Chicken Vision</h1>
                <p className="text-xs text-gray-500">AI-Powered Poultry Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                Console
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-white text-3xl">🐣</span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Chicken Vision
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              AI-powered chicken surveillance meets blockchain egg certificates!
              <br />
              Because apparently even chickens need crypto now. 🤖🐔⛓️
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a 
                href="/dashboard"
                className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Launch Console
              </a>
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Upload Egg Image
              </button>
            </div>

            {showImageUpload && (
              <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      AI-Powered Egg Analysis
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Upload an image for comprehensive analysis using AWS Bedrock
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ImageUpload />
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 border-t border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built on AWS Infrastructure
            </h2>
            <p className="text-lg text-gray-600">
              Leveraging enterprise-grade AWS services for reliability and scale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '👁️',
                title: 'Computer Vision',
                description: 'Advanced image recognition with AWS Bedrock for egg quality assessment and visual analysis',
                service: 'Amazon Bedrock'
              },
              {
                icon: '⛓️',
                title: 'Blockchain Certification',
                description: 'Immutable record keeping using Amazon Managed Blockchain Access on Ethereum',
                service: 'AMB Access'
              },
              {
                icon: '📊',
                title: 'Real-time Monitoring',
                description: 'Live environmental tracking with DynamoDB streams and Lambda functions',
                service: 'DynamoDB + Lambda'
              },
              {
                icon: '🔄',
                title: 'Automated Rotation',
                description: 'Precision servo control system with IoT integration and monitoring',
                service: 'AWS IoT Core'
              },
              {
                icon: '📱',
                title: 'Vision Dashboard',
                description: 'Real-time visual monitoring interface deployed on CloudFront with S3 hosting',
                service: 'CloudFront + S3'
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                description: 'IAM-based access control with encryption at rest and in transit',
                service: 'AWS IAM + KMS'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {feature.service}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Data Section */}
        <div className="py-20 border-t border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Live System Data
            </h2>
            <p className="text-lg text-gray-600">
              Real-time data from our production Chicken Vision system
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Clutch Data */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📸 Image Analysis</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Live</span>
              </div>
              <div className="space-y-3">
                <ClutchData />
              </div>
            </div>

            {/* Individual Eggs */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🥚 Registered Eggs</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Active</span>
              </div>
              <div className="space-y-3">
                <EggData />
              </div>
            </div>

            {/* Environmental Data */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🌡️ Environment</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Real-time</span>
              </div>
              <div className="space-y-3">
                <EnvironmentData />
              </div>
            </div>
          </div>

          {/* Blockchain Status */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">⛓️ Blockchain Network Status</h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">Connected</span>
            </div>
            <BlockchainStatus />
          </div>

          {/* API Endpoints */}
          <div className="bg-gray-900 p-8 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-6 text-center">🔗 Available API Endpoints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">GET</span>
                  <span className="text-gray-300">/clutches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">GET</span>
                  <span className="text-gray-300">/clutches/{'{id}'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">GET</span>
                  <span className="text-gray-300">/api/eggs</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">GET</span>
                  <span className="text-gray-300">/api/environment/current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">GET</span>
                  <span className="text-gray-300">/api/blockchain/network-status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400">POST</span>
                  <span className="text-gray-300">/api/eggs</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <span className="text-gray-400 text-sm">Base URL: https://p5f57pijb2.execute-api.us-east-1.amazonaws.com</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center border-t border-gray-200">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Launch the management console to begin monitoring your chicken hatching operations.
            </p>
            <a 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Launch Console
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🥚</span>
              </div>
              <span className="text-sm text-gray-600">Chicken Vision - Powered by AWS</span>
            </div>
            <div className="text-sm text-gray-500">
              Built for the Magnificent Impracticability category
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}