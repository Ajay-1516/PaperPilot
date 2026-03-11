import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, BookOpen, Brain, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
          
  const features = [   
    {
      /*irirevorejoeooejokekv */
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: "Multi-Source Input",
      description: "Upload PDFs, enter DOIs, or provide URLs to process research papers from various sources."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI agents classify topics, generate summaries, and create cross-paper synthesis."
    },
    {
      icon: <Mic className="w-8 h-8 text-primary-600" />,
      title: "Podcast Generation",
      description: "Transform research summaries into engaging audio podcasts for easy consumption."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "Citation Tracking",
      description: "Automatically generate citation logs in multiple formats."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            PaperPilot
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform research papers into engaging podcast summaries using advanced AI agents
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your research papers, enter DOIs, or provide URLs to begin creating your personalized research podcast.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary text-lg px-8 py-3"
            >
              Start Creating Podcast
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload & Input
              </h3>
              <p className="text-gray-600">
                Upload PDF files, enter DOIs, or provide URLs of research papers you want to analyze.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Processing
              </h3>
              <p className="text-gray-600">
                Our AI agents extract text, classify topics, generate summaries, and create synthesis.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Your Podcast
              </h3>
              <p className="text-gray-600">
                Receive individual summaries, cross-paper synthesis, and audio podcasts ready to listen.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>Powered by advanced AI agents and cutting-edge NLP technology</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 