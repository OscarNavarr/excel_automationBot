import { NextResponse } from 'next/server';
import { read, utils } from 'xlsx';

// This function normalizes text by converting it to lowercase, remove special characters and trailing whitespaces,
const normalizeText = (text) => text.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// This function updates and cleans `sheet1` based on `sheet2`
function updateAndCleanSheet1(sheet1, sheet2) {
  const normalizedSheet1Map = new Map();
  const result = [];

  // Create a map of normalized `Nom` values from `sheet1`
  for (let i = 0; i < sheet1.length; i++) {
    const normalizedNom1 = normalizeText(sheet1[i].Nom);
    normalizedSheet1Map.set(normalizedNom1, i);
  }

  // Update `sheet1` with values ​​from `sheet2` and add new values
  for (let i = 0; i < sheet2.length; i++) {
    const normalizedNom2 = normalizeText(sheet2[i].nom);
    const indexInSheet1 = normalizedSheet1Map.get(normalizedNom2);

    if (indexInSheet1 !== undefined) {
      // If exists in `sheet1`, update the row
      sheet1[indexInSheet1] = {
        ...sheet1[indexInSheet1],
        "Pays": sheet2[i].pays?.length > 0 ? sheet2[i].pays : sheet1[indexInSheet1].Pays,
        "Langue": sheet2[i].Langue || sheet1[indexInSheet1].Langue,
        "Interlocuteur commercial": sheet2[i].f_contact?.length > 0 ? sheet2[i].f_contact : sheet1[indexInSheet1]["Interlocuteur commercial"],
        "email interlocuteur": sheet2[i].email?.length > 0 ? sheet2[i].email : sheet1[indexInSheet1]["email interlocuteur"],
        "Téléphone": sheet2[i].tel?.length > 0 ? sheet2[i].tel : sheet1[indexInSheet1]["Téléphone"],
        "Ville": sheet2[i].ville?.length > 0 ? sheet2[i].ville : sheet1[indexInSheet1].Ville,
        "Secteur d'activité": sheet2[i].theme_principal?.length > 0 ? sheet2[i].theme_principal : sheet1[indexInSheet1]["Secteur d'activité"]
      };
    } else {
      // If it does not exist in `sheet1`, add the row from `sheet2` to `sheet1`
      sheet1.push({
        "Statut": "-",
        "Nom": sheet2[i].nom,
        "Pays": sheet2[i].pays,
        "Langue": sheet2[i].Langue,
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
    }
  }

  // Remove duplicate rows in `sheet1` based on column `Name`
  const uniqueNames = new Set();
  for (let i = 0; i < sheet1.length; i++) {
    const normalizedNom1 = normalizeText(sheet1[i].Nom);
    if (!uniqueNames.has(normalizedNom1)) {
      uniqueNames.add(normalizedNom1);
      result.push(sheet1[i]);
    }
  }

  return result;
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

    const sheet1 = utils.sheet_to_json(workbook1.Sheets[workbook1.SheetNames[0]]);
    const sheet2 = utils.sheet_to_json(workbook2.Sheets[workbook2.SheetNames[0]]);

    // Update and clean `sheet1` based on `sheet2`
    const updatedSheet1 = updateAndCleanSheet1(sheet1, sheet2);

    return NextResponse.json({ updatedSheet1 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar los archivos', details: error.message }, { status: 500 });
  }
}
