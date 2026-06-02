import { datosUE } from "./uecountries.js";


let idiomaSeleccionado = "ninguno";
let soloOficiales = false;

const ESTILO_BOTON = "d-inline-flex align-items-center gap-1 border border-secondary rounded px-2 py-1 mb-1 me-1";

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    generarIdiomas();
    configurarFiltros();
    pintaLista();
});


function pintaLista() {
    let lista = [...datosUE];


    lista.sort((a, b) => b.poblacion_nacional - a.poblacion_nacional);

    const sumaGeneral = datosUE.reduce((suma, p) => suma + p.poblacion_nacional, 0);
    const mediaPoblacion = sumaGeneral / datosUE.length;


    lista = aplicarFiltros(lista);


    pintarTabla(lista, mediaPoblacion, sumaGeneral);
    pintarInfo(lista);
}


function aplicarFiltros(lista) {
    if (idiomaSeleccionado === "ninguno") return lista;

    return lista.filter(pais => {
        const oficial = pais.idiomas && pais.idiomas.oficial ? pais.idiomas.oficial.toLowerCase() : "";
        const otros = pais.idiomas && pais.idiomas.otros_idiomas ? pais.idiomas.otros_idiomas.toLowerCase() : "";
        const idioma = idiomaSeleccionado.toLowerCase();

        // Limpiamos los strings de idiomas separados por comas
        const matchOficial = oficial.split(",").map(i => i.trim()).includes(idioma);
        const matchOtros = otros.split(",").map(i => i.trim()).includes(idioma);

        if (soloOficiales) {
            return matchOficial;
        }
        return matchOficial || matchOtros;
    });
}



function pintarTabla(lista, mediaPoblacion, sumaGeneral) {
    const contenedorTabla = document.getElementById("tabla");


    let tablaHTML = `
        <thead class="table">
            <tr>
                <th>País</th>
                <th>Capital</th>
               <th>Población <div class="small fw-normal text-muted">(${sumaGeneral.toLocaleString("es-ES")} hab.)</div></th>
                <th>Fecha Adhesión</th>
            </tr>
        </thead>
        <tbody id="tabla-paises">
    `;


    tablaHTML += lista.map(p => {
        const esMonarquia = p.regimen_politico?.tipo?.toLowerCase()?.includes("monarquía");
        const nombrePais = esMonarquia ? `${p.pais} 👑` : p.pais;
        const fecha = new Date(p.fecha_adhesion).toLocaleDateString("es-ES");


        const claseResaltado = p.poblacion_nacional > mediaPoblacion ? 'class="text-success fw-bold "' : '';

        return `
            <tr>
                <td ${claseResaltado}>${nombrePais}</td>
                <td>${p.capital}</td>
                <td>${p.poblacion_nacional.toLocaleString("es-ES")}</td>
                <td>${fecha}</td>
            </tr>
        `;
    }).join("");

    tablaHTML += `</tbody>`;

    contenedorTabla.innerHTML = tablaHTML;
}

// Genera dinámicamente los botones de idiomas en horizontal
function generarIdiomas() {
    const set = new Set();

    datosUE.forEach(p => {
        if (p.idiomas && p.idiomas.oficial) {
            p.idiomas.oficial.split(",").forEach(i => set.add(i.trim().toLowerCase()));
        }
        if (p.idiomas && p.idiomas.otros_idiomas) {
            p.idiomas.otros_idiomas.split(",").forEach(i => set.add(i.trim().toLowerCase()));
        }
    });

    const idiomas = [...set].filter(i => i && i !== "null").sort();
    const cont = document.getElementById("radios-idiomas");

    let htmlContent = `
        <div class="${ESTILO_BOTON}">
            <input type="radio" name="idioma" id="lang-ninguno" value="ninguno" checked>
            <label for="lang-ninguno">Ninguno</label>
        </div>
    `;

    idiomas.forEach((i, index) => {
        htmlContent += `
            <div class="${ESTILO_BOTON}">
                <input type="radio" name="idioma" id="lang-${index}" value="${i}">
                <label class="text-capitalize" for="lang-${index}">${i}</label>
            </div>
        `;
    });

    cont.innerHTML = htmlContent;
}


function configurarFiltros() {
    document.getElementById("solo-oficiales").addEventListener("change", (e) => {
        soloOficiales = e.target.checked;
        pintaLista();
    });

    document.getElementById("radios-idiomas").addEventListener("change", (e) => {
        if (e.target.name === "idioma") {
            idiomaSeleccionado = e.target.value;
            pintaLista();
        }
    });
}


function pintarInfo(lista) {
    const cont = document.getElementById("info-filtro");

    if (idiomaSeleccionado === "ninguno") {

        cont.innerHTML = `<div>Se muestran los ${lista.length} países de la UE</div>`;
    } else {
        const tipo = soloOficiales ? "oficial" : "oficial/no oficial";
        cont.innerHTML = `<div>Filtrado por: "${idiomaSeleccionado}" (${tipo}) (${lista.length} de ${datosUE.length})</div>`;
    }
}