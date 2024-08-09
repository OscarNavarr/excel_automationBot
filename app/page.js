'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileUpload = async () => {
    if (!file1 || !file2) {
      console.error('No se seleccionaron ambos archivos');
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.updatedSheet1);  
        console.log('Datos actualizados:', data.updatedSheet1);
      } else {
        console.error('Error al procesar los archivos');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const handleExportTable = () => {
    const worksheet = XLSX.utils.json_to_sheet(result);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'result.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="bg-blue-600 w-full py-4">
        <h1 className="text-white text-center text-2xl font-bold">Excel Automation Bot</h1>
      </header>
      <main className="flex flex-col items-center mt-8 w-full max-w-2xl">
        <div className="w-[90vw] bg-white p-6 rounded-lg shadow-md">
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
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-[90vw] overflow-auto  max-h-[50rem] ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <button onClick={handleExportTable} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Export Data</button>
            </div>
            <table className="max-w-[85vw] bg-white border ">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Statut</th>
                  <th className="py-2 px-4 border-b">Nom</th>
                  <th className="py-2 px-4 border-b">Pays</th>
                  <th className="py-2 px-4 border-b">Langue</th>
                  <th className="py-2 px-4 border-b">Interlocuteur commercial</th>
                  <th className="py-2 px-4 border-b">email interlocuteur</th>
                  <th className="py-2 px-4 border-b">Téléphone</th>
                  <th className="py-2 px-4 border-b">Télécopie</th>
                  <th className="py-2 px-4 border-b">email</th>
                  <th className="py-2 px-4 border-b">Pige</th>
                  <th className="py-2 px-4 border-b">C.P.</th>
                  <th className="py-2 px-4 border-b">Ville</th>
                  <th className="py-2 px-4 border-b">Secteur d'activité</th>
                  <th className="py-2 px-4 border-b">Informations</th>
                  <th className="py-2 px-4 border-b">Impayé</th>
                  <th className="py-2 px-4 border-b">2025</th>
                </tr>
              </thead>  
              <tbody>
                {result.map((row, index) => (
                  <tr key={index} className={`${(index + 1) % 2 == 0 ? "bg-slate-300": "bg-white" }`}>
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">{row.Statut}</td>
                    <td className="py-2 px-4 border-b">{row.Nom}</td>
                    <td className="py-2 px-4 border-b">{row.Pays}</td>
                    <td className="py-2 px-4 border-b">{row.Langue}</td>
                    <td className="py-2 px-4 border-b">{row["Interlocuteur commercial"]}</td>
                    <td className="py-2 px-4 border-b">{row["email interlocuteur"]}</td>
                    <td className="py-2 px-4 border-b">{row["Téléphone"]}</td>
                    <td className="py-2 px-4 border-b">{row["Télécopie"]}</td>
                    <td className="py-2 px-4 border-b">{row.email}</td>
                    <td className="py-2 px-4 border-b">{row.Pige}</td>
                    <td className="py-2 px-4 border-b">{row["C.P."]}</td>
                    <td className="py-2 px-4 border-b">{row.Ville}</td>
                    <td className="py-2 px-4 border-b">{row["Secteur d'activité"]}</td>
                    <td className="py-2 px-4 border-b">{row.Informations}</td>
                    <td className="py-2 px-4 border-b">{row.Impayé}</td>
                    <td className="py-2 px-4 border-b">{row["2025"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
