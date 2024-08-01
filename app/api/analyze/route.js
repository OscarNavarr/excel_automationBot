import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {xlsx,read,utils} from 'xlsx';


function compareSheets(sheet1, sheet2) {
  const differences = {
    sheet1Only: sheet1.filter(row1 => !sheet2.some(row2 => row1.ID === row2.ID)),
    sheet2Only: sheet2.filter(row2 => !sheet1.some(row1 => row1.ID === row2.ID)),
  };
  return differences;
}


export async function POST(request) {
  try {
    
    const formData = await request.formData();
    const file1 = formData.get('file1');
    const file2 = formData.get('file2');

    if (!file1 || !file2) {
     
      return NextResponse.json({ error: 'Archivos faltantes' }, { status: 400 });
    }

   

    // Leer los archivos usando arrayBuffer
    
    const file1Buffer = await file1.arrayBuffer();
    const file2Buffer = await file2.arrayBuffer();

    // Convertir ArrayBuffer a Buffer para usar con xlsx
    
    const buffer1 = Buffer.from(file1Buffer);
    const buffer2 = Buffer.from(file2Buffer);

   

    // Procesar los archivos Excel
   
    const workbook1 = read(buffer1, { type: 'buffer' });
    const workbook2 = read(buffer2, { type: 'buffer' });

    const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

    // Convertir las hojas a JSON
   
    const data1 = utils.sheet_to_json(sheet1);
    const data2 = utils.sheet_to_json(sheet2);

    // Comparar los datos
    
    const differences = compareSheets(data1, data2);

    return NextResponse.json({ data1, data2, differences });

  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar los archivos', details: error.message }, { status: 500 });
  }
}
