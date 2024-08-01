'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await axios.post('/api/analyze/route.js', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="bg-blue-600 w-full py-4">
        <h1 className="text-white text-center text-2xl font-bold">Excel Automation Bot</h1>
      </header>
      <main className="flex flex-col items-center mt-8 w-full max-w-2xl">
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Excel Files</h2>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile1(e.target.files[0])}
            className="block w-full mb-4"
          />
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile2(e.target.files[0])}
            className="block w-full mb-4"
          />
          <button
            onClick={handleFileUpload}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Analyze Files
          </button>
        </div>
        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {/* Renderiza los resultados aquí */}
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <a
              href="/api/download"
              className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Result
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
