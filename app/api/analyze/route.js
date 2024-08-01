
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export const config = {
  api: {
    bodyParser: false, // Desactiva el bodyParser integrado de Next.js para manejar archivos
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), '/uploads'); // Directorio temporal para cargar archivos
    form.keepExtensions = true; // Mantener la extensión del archivo

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cargar los archivos' });
      }

      const file1Path = files.file1.filepath; // `filepath` contiene la ruta temporal del archivo cargado
      const file2Path = files.file2.filepath;

      try {
        const workbook1 = xlsx.readFile(file1Path);
        const workbook2 = xlsx.readFile(file2Path);

        const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
        const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

        // Convierte las hojas a JSON
        const data1 = xlsx.utils.sheet_to_json(sheet1);
        const data2 = xlsx.utils.sheet_to_json(sheet2);

        // Compara los datos (puedes personalizar esta función)
        const differences = compareSheets(data1, data2);

        // Responde con los datos procesados
        res.status(200).json({ data1, data2, differences });
      } catch (error) {
        res.status(500).json({ error: 'Error al procesar los archivos' });
      } finally {
        // Elimina los archivos temporales si es necesario
        fs.unlink(file1Path, () => {});
        fs.unlink(file2Path, () => {});
      }
    });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

// Función para comparar los datos de dos hojas
function compareSheets(sheet1, sheet2) {
  // Implementa tu lógica de comparación aquí
  // Esto es solo un ejemplo básico
  const differences = {
    sheet1Only: sheet1.filter(row1 => !sheet2.some(row2 => row1.ID === row2.ID)),
    sheet2Only: sheet2.filter(row2 => !sheet1.some(row1 => row1.ID === row2.ID)),
  };
  return differences;
}
