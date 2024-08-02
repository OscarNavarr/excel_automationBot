import { NextResponse } from 'next/server';
import { read, utils } from 'xlsx';

function compareSheets(sheet1, sheet2) {
  const result = [];
  const nom_client_that_are_not_in_sheet1 = [];

  // Marcar los nombres ya encontrados en sheet1 para evitar duplicados
  const foundNames = new Set();

  for (let i = 0; i < sheet2.length; i++) {
    let found = false; // Bandera para verificar si se encontró en sheet1
    for (let j = 0; j < sheet1.length; j++) {
      if (sheet2[i].nom.toLowerCase().trim() === sheet1[j].Nom.toLowerCase().trim()) {
        result.push({
          "Statut": sheet1[j].Statut,
          "Nom": sheet1[j].Nom,
          "Pays": sheet2[i].pays?.length > 0 ? sheet2[i].pays : sheet1[j].Pays,
          "Langue": sheet2[i].Langue,
          "Interlocuteur commercial": sheet2[i].f_contact?.length > 0 ? sheet2[i].f_contact : sheet1[j]["Interlocuteur commercial"],
          "email interlocuteur": sheet2[i].email?.length > 0 ? sheet2[i].email : sheet1[j]["email interlocuteur"],
          "Téléphone": sheet2[i].tel?.length > 0 ? sheet2[i].tel : sheet1[j]["Téléphone"],
          "Télécopie": sheet1[j]["Télécopie"],
          "email": sheet2[i].email?.length > 0 ? sheet2[i].email : sheet1[j].email,
          "Pige": sheet1[j].Pige,
          "C.P.": sheet2[i].cp?.length > 0 ? sheet2[i].cp : sheet1[j]["C.P."],
          "Ville": sheet2[i].ville?.length > 0 ? sheet2[i].ville : sheet1[j].Ville,
          "Secteur d'activité": sheet2[i].theme_principal?.length > 0 ? sheet2[i].theme_principal : sheet1[j]["Secteur d'activité"],
          "Informations": sheet1[j].Informations,
          "Impayé": sheet1[j].Impayé,
          "2025": sheet1[j]["2025"]
        });
        found = true; // Marca como encontrado
        foundNames.add(sheet2[i].nom.toLowerCase().trim()); // Agregar a los nombres encontrados
        break;
      }
    }

    // Si no se encontró en sheet1, agregarlo a los resultados y a la lista de nombres no encontrados
    if (!found && !foundNames.has(sheet2[i].nom.toLowerCase().trim())) {
      result.push({
        "Statut": "-",
        "Nom": sheet2[i].nom,
        "Pays": sheet2[i].pays,
        "Langue": "-",
        "Interlocuteur commercial": sheet2[i].f_contact,
        "email interlocuteur": sheet2[i].email,
        "Téléphone": sheet2[i].tel,
        "Télécopie": "-",
        "email": sheet2[i].email,
        "Pige": "-",
        "C.P.": sheet2[i].cp,
        "Ville": sheet2[i].ville,
        "Secteur d'activité": sheet2[i].theme_principal,
        "Informations": "-",
        "Impayé": "-",
        "2025": "-"
      });
      nom_client_that_are_not_in_sheet1.push(sheet2[i].nom);
    }
  }

  return { result, nom_client_that_are_not_in_sheet1 };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file1 = formData.get('file1');
    const file2 = formData.get('file2');

    if (!file1 || !file2) {
      return NextResponse.json({ error: 'Archivos faltantes' }, { status: 400 });
    }

    const file1Buffer = await file1.arrayBuffer();
    const file2Buffer = await file2.arrayBuffer();

    const buffer1 = Buffer.from(file1Buffer);
    const buffer2 = Buffer.from(file2Buffer);

    const workbook1 = read(buffer1, { type: 'buffer' });
    const workbook2 = read(buffer2, { type: 'buffer' });

    const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];

    const data1 = utils.sheet_to_json(sheet1);
    const data2 = utils.sheet_to_json(sheet2);

    const { result: differences, nom_client_that_are_not_in_sheet1 } = compareSheets(data1, data2);

    return NextResponse.json({ data1, differences, nom_client_that_are_not_in_sheet1 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar los archivos', details: error.message }, { status: 500 });
  }
}
