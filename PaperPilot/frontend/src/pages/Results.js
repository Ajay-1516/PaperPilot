import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Users, 
  Tag,
  Volume2,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import AudioPlayer from 'react-audio-player';

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    const storedResults = localStorage.getItem('analysisResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      navigate('/upload');
    }
  }, [navigate]);

  const toggleSummary = (index) => {
    setExpandedSummaries(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAudio = (filename) => {
    const link = document.createElement('a');
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://paperpilot-5dua.onrender.com';
    link.href = `${API_BASE_URL}/audio/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio download started!');
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </button>
            <h1 className="text-4xl font-bold text-gray-900">
              Analysis Results
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Session: {results.session_id} • {results.papers.length} papers processed
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {results.statistics.total_papers}
            </div>
            <div className="text-sm text-gray-600">Total Papers</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.statistics.successful_summaries}
            </div>
            <div className="text-sm text-gray-600">Summaries Generated</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.statistics.successful_audio_files}
            </div>
            <div className="text-sm text-gray-600">Audio Files Created</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {results.statistics.podcast_created ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Podcast Generated</div>
          </div>
        </div>

        {/* Individual Paper Summaries */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Individual Paper Summaries
          </h2>
          <div className="space-y-6">
            {results.papers.map((paper, index) => (
              <div key={index} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {paper.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {paper.topic}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {paper.authors.length > 0 ? paper.authors.join(', ') : 'Unknown Authors'}
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {paper.source}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paper.summary, `Paper ${index + 1}`)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedText === `Paper ${index + 1}` ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <div className={`text-gray-700 leading-relaxed ${
                    expandedSummaries[index] ? '' : 'line-clamp-3'
                  }`}>
                    {paper.summary}
                  </div>
                  {paper.summary.length > 200 && (
                    <button
                      onClick={() => toggleSummary(index)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                    >
                      {expandedSummaries[index] ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                {/* Audio Player */}
                {paper.audio_file && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Volume2 className="w-5 h-5 text-primary-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Audio Summary
                        </span>
                      </div>
                      <button
                        onClick={() => downloadAudio(paper.audio_file)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <AudioPlayer
                        src={`${process.env.REACT_APP_API_URL || 'https://paperpilot-5dua.onrender.com'}/audio/${paper.audio_file}`}
                        controls
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Paper Synthesis */}
        {results.synthesis && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Cross-Paper Synthesis
            </h2>
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unified Summary
                  </h3>
                  <p className="text-sm text-gray-600">
                    {results.synthesis.num_papers} papers • {results.synthesis.type}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(results.synthesis.text, 'Synthesis')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedText === 'Synthesis' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <div className="text-gray-700 leading-relaxed mb-6">
                {results.synthesis.text}
              </div>

              {/* Podcast Audio */}
              {results.audio.podcast_file && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Volume2 className="w-6 h-6 text-primary-600 mr-2" />
                      <span className="text-lg font-medium text-gray-700">
                        Complete Podcast
                      </span>
                    </div>
                    <button
                      onClick={() => downloadAudio(results.audio.podcast_file)}
                      className="btn-primary text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <AudioPlayer
                    src={`${process.env.REACT_APP_API_URL || 'https://paperpilot-5dua.onrender.com'}/audio/${results.audio.podcast_file}`}
                    controls
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Duration: {Math.round(results.audio.podcast_duration / 60)} minutes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Citations Section */}
        {results.citations && results.citations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Citations
            </h2>
            <div className="space-y-4">
              {results.citations.map((citation, idx) => (
                <div key={idx} className="card p-4">
                  <div><strong>Source:</strong> {citation.source}</div>
                  <div><strong>Topic:</strong> {citation.topic}</div>
                  <div><strong>Summary:</strong> {citation.summary || 'No summary available.'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Section */}
        {/*
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Download Files
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Summary Files</h4>
              <div className="space-y-2">
                {results.files.summaries.map((file, index) => (
                  <a
                    key={index}
                    href={`http://localhost:8004/summaries/${file.filename}`}
                    download
                    className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {file.filename}
                  </a>
                ))}
                <a
                  download
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {results.files.synthesis.filename}
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Citation Files</h4>
              <a
                href={`http://localhost:8004/citations/${results.citations.log_file}`}
                download
                className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {results.citations.log_file}
              </a>
            </div>
          </div>
        </div>
        */}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary mr-4"
          >
            Process More Papers
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 
