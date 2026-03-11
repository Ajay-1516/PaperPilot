import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Link, Hash, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Upload = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [dois, setDois] = useState('');
  const [urls, setUrls] = useState('');
  const [topicList, setTopicList] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('Only PDF files are supported');
    }
    
    setFiles(pdfFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.length && !dois.trim() && !urls.trim()) {
      toast.error('Please provide at least one input: PDF files, DOIs, or URLs');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add DOIs
      if (dois.trim()) {
        formData.append('dois', dois);
      }
      
      // Add URLs
      if (urls.trim()) {
        formData.append('urls', urls);
      }
      
      // Add topic list
      if (topicList.trim()) {
        formData.append('topic_list', topicList);
      }

      // Log FormData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://paperpilot-5dua.onrender.com';
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
      });

      // Store results in localStorage for the Results page
      localStorage.setItem('analysisResults', JSON.stringify(response.data));
      
      toast.success('Analysis completed successfully!');
      navigate('/results');
      
    } catch (error) {
      console.error('Error during analysis:', error);
      if (error.response) {
        // Log the full error response for debugging
        console.error('Backend error response:', error.response.data);
        let errorMsg = '';
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
        toast.error(`Analysis failed: ${errorMsg}`);
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again with fewer papers.');
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload & Input
          </h1>
          <p className="text-lg text-gray-600">
            Upload PDF files, enter DOIs, or provide URLs to generate your research podcast
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <UploadIcon className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Upload PDF Files
              </h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Click to upload PDF files
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop files here
                </p>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({files.length}):
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DOI Input Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Hash className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Enter DOIs
              </h2>
            </div>
            
            <textarea
              value={dois}
              onChange={(e) => setDois(e.target.value)}
              placeholder="Enter DOIs separated by commas (e.g., 10.1038/nature12373, 10.1126/science.1234567)"
              className="input-field h-24 resize-none"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter one or more DOIs separated by commas
            </p>
          </div>

          {/* URL Input Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Link className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Enter URLs
              </h2>
            </div>
            
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="Enter URLs separated by commas (e.g., https://arxiv.org/abs/1234.5678, https://example.com/paper)"
              className="input-field h-24 resize-none"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter one or more URLs separated by commas
            </p>
          </div>

          {/* Topic List Section */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Topic List (Optional)
              </h2>
            </div>
            
            <textarea
              value={topicList}
              onChange={(e) => setTopicList(e.target.value)}
              placeholder="Enter topics separated by commas for better classification (e.g., machine learning, artificial intelligence, deep learning)"
              className="input-field h-24 resize-none"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Optional: Provide topics to improve paper classification
            </p>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || (!files.length && !dois.trim() && !urls.trim())}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Generate Podcast
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>1. Text Extraction:</strong> Our AI extracts and processes text from your inputs
            </div>
            <div>
              <strong>2. Analysis:</strong> Papers are classified, summarized, and synthesized
            </div>
            <div>
              <strong>3. Audio Generation:</strong> Summaries are converted to podcast audio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload; 
