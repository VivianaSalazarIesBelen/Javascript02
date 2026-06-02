import { datosUE } from "./uecountries.js";

// Estado global para recordar las selecciones
let idiomaSeleccionado = "todos";
let soloOficiales = false;

// Clases de Bootstrap para pintar los botones en horizontal con bordes
const ESTILO_BOTON = "d-inline-flex align-items-center gap-1 border border-secondary rounded px-2 py-1 mb-1 me-1";

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    generarIdiomas();
    configurarFiltros();
    render();
});

// Motor que redibuja la interfaz
function render() {
    let lista = [...datosUE];

    // Orden siempre descendente por población
    lista.sort((a, b) => b.poblacion_nacional - a.poblacion_nacional);

    // Pasamos los datos por el embudo de filtros
    lista = aplicarFiltros(lista);

    // Pintamos los elementos resultantes en el HTML
    pintarTabla(lista);
    pintarInfo(lista);
}

// Aplica las condiciones de filtrado
function aplicarFiltros(lista) {
    if (idiomaSeleccionado === "todos") return lista;

    return lista.filter(pais => {
        const oficial = pais.idiomas.oficial?.toLowerCase() || "";
        const otros = pais.idiomas.otros_idiomas?.toLowerCase() || "";
        const idioma = idiomaSeleccionado.toLowerCase();

        // Convertimos los strings separados por comas en arrays limpios
        const matchOficial = oficial.split(",").map(i => i.trim()).includes(idioma);
        const matchOtros = otros.split(",").map(i => i.trim()).includes(idioma);

        if (soloOficiales) {
            return matchOficial; // Si el checkbox está activo, solo cuenta si es oficial
        }
        return matchOficial || matchOtros; // Si no, cuenta si es oficial u otros
    });
}

// Genera las filas de la tabla de países
function pintarTabla(lista) {
    const contenedor = document.getElementById("tabla-paises");

    contenedor.innerHTML = lista.map(p => {
        const esMonarquia = p.regimen_politico?.tipo?.toLowerCase()?.includes("monarquía");
        const nombrePais = esMonarquia ? `${p.pais} 👑` : p.pais;
        const fecha = new Date(p.fecha_adhesion).toLocaleDateString("es-ES");

        return `
            <tr>
                <td>${nombrePais}</td>
                <td>${p.capital}</td>
                <td>${p.poblacion_nacional.toLocaleString("es-ES")}</td>
                <td>${fecha}</td>
            </tr>
        `;
    }).join("");
}

// Recolecta los idiomas únicos y crea los botones de radio horizontales
function generarIdiomas() {
    const set = new Set();

    datosUE.forEach(p => {
        if (p.idiomas.oficial) {
            p.idiomas.oficial.split(",").forEach(i => set.add(i.trim().toLowerCase()));
        }
        if (p.idiomas.otros_idiomas) {
            p.idiomas.otros_idiomas.split(",").forEach(i => set.add(i.trim().toLowerCase()));
        }
    });

    const idiomas = [...set].filter(i => i && i !== "null").sort();
    const cont = document.getElementById("radios-idiomas");

    // Primer botón horizontal por defecto: todos
    let htmlContent = `
        <div class="${ESTILO_BOTON}">
            <input type="radio" name="idioma" id="lang-todos" value="todos" checked>
            <label for="lang-todos">todos</label>
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

// Configura los escuchadores de eventos
function configurarFiltros() {
    // Escucha el cambio del CHECKBOX
    document.getElementById("solo-oficiales").addEventListener("change", (e) => {
        soloOficiales = e.target.checked;
        render();
    });

    // Escucha el cambio de los RADIOS horizontales
    document.getElementById("radios-idiomas").addEventListener("change", (e) => {
        if (e.target.name === "idioma") {
            idiomaSeleccionado = e.target.value;
            render();
        }
    });
}

// Imprime el texto de control inferior
function pintarInfo(lista) {
    const cont = document.getElementById("info-filtro");

    if (idiomaSeleccionado === "todos") {
        cont.innerHTML = `Se muestran ${lista.length} países de la UE`;
    } else {
        const tipo = soloOficiales ? "oficial" : "oficial u otros";
        cont.innerHTML = `Filtrado por: "${idiomaSeleccionado}" (${tipo}) (${lista.length} de ${datosUE.length})`;
    }
}