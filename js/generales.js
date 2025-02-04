import { showAlert } from "../js/showAlert.js";

// URL de la API
const UrlApi = "https://resultados.mininterior.gob.ar/api";

// Constantes para tipo de elección y recuento
const tipoEleccion = 2; // 2 = Generales
const tipoRecuento = 1; // Recuento definitivo

// Atajo para querySelector
const $ = (selector) => document.querySelector(selector);

// Elementos del DOM
const periodosSelect = $("#selectPeriodo");
const cargoSelect = $("#selectCargo");
const distritoSelect = $("#selectDistrito");
const seccionSelect = $("#selectSeccion");
const btnFiltrar = $("#btnFiltrar");
const inputSeccionProvincial = $("#hdSeccionProvincial");
const btnInformes = $("#btnInformes");
const tituloPrincipal = $("#tituloPrincipal");
const parrafoPrincipal = $("#parrafoPrincipal");

const mesasComputadas = $("#mesasComputadas");
const electores = $("#electores");
const porcentaje = $("#porcentaje");

// Objeto para almacenar los datos seleccionados
const seleccion = {
  anio: "",
  cargo: "",
  distrito: "",
  seccion: "",
};

let distritoTitulo = "";
let cargoTitulo = "";
let seccionTitulo = "";

let datosGenerales = null; // Almacena los datos que retorna la API
let resultados;

btnFiltrar.disabled = true;

//Funcion al presionar el filtrar

const actualizarTitulos = () => {
  let eleccion = tipoEleccion === 1 ? "Paso" : "Generales";
  let titulo = `Elecciones ${seleccion.anio} | ${eleccion}`;
  let parrafo = `${seleccion.anio} > ${eleccion} > ${cargoTitulo} > ${distritoTitulo} > ${seccionTitulo}`;

  tituloPrincipal.textContent = `${titulo}`;
  parrafoPrincipal.textContent = `${parrafo}`;
};

const filtrarResultados = async () => {
  let seccionProvincialId = 0;
  let circuitoId = "";
  let mesaId = "";
  const url = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${periodosSelect.value}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${cargoSelect.value}&distritoId=${distritoSelect.value}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionSelect.value}&circuitoId=${circuitoId}&mesaId=${mesaId}`;
  console.log("url", url);

  const result = await fetch(url);

  if (!result.ok) {
    showAlert(
      "error",
      `Error al conectar al servidor. Código: ${result.status}`
    );
  } else {
    resultados = await result.json();
    console.log(resultados);

    mesasComputadas.textContent = `${resultados.estadoRecuento.mesasTotalizadas}`;
    electores.textContent = `${resultados.estadoRecuento.cantidadElectores}`;
    porcentaje.textContent = `${resultados.estadoRecuento.participacionPorcentaje}%`;
    actualizarTitulos();
  }
};

// Cargar períodos dinámicamente
const cargarPeriodos = async () => {
  try {
    const response = await fetch(`${UrlApi}/menu/periodos`);
    const periodos = await response.json();

    console.log(periodos);

    periodos.forEach((anio) => {
      const option = document.createElement("option");
      option.value = anio;
      option.textContent = anio;
      periodosSelect.appendChild(option);
    });
  } catch (err) {
    alert("no");
  }
};

// Cargar cargos dinámicamente
const cargarCargos = async () => {
  try {
    seleccion.anio = periodosSelect.value;
    const response = await fetch(`${UrlApi}/menu?año=${seleccion.anio}`);
    datosGenerales = await response.json();

    const elecciones = datosGenerales.filter(
      (e) => e.IdEleccion === tipoEleccion
    );
    cargoSelect.innerHTML = "<option value='' disabled selected>Cargo</option>";

    elecciones.forEach((eleccion) => {
      eleccion.Cargos.forEach((cargo) => {
        const option = document.createElement("option");
        option.value = cargo.IdCargo;
        option.textContent = cargo.Cargo;
        cargoSelect.appendChild(option);
      });
    });
  } catch (err) {
    showAlert("error", "Error al cargar los cargos.");
  }
};

const cargarDistrito = () => {
  cargoTitulo = cargoSelect.options[cargoSelect.selectedIndex].textContent;
  console.log("Datos generales:", datosGenerales);

  if (!datosGenerales) {
    console.error("Error: datosGenerales no tiene datos.");
    return;
  }

  limpiarSelect(distritoSelect);
  limpiarSelect(seccionSelect);

  seleccion.cargo = cargoSelect.value;
  console.log("Cargo seleccionado:", seleccion.cargo);

  datosGenerales.forEach((eleccion) => {
    if (eleccion.IdEleccion == tipoEleccion) {
      eleccion.Cargos.forEach((cargo) => {
        if (cargo.IdCargo === seleccion.cargo) {
          cargo.Distritos.forEach((distrito) => {
            const option = document.createElement("option");
            option.value = distrito.IdDistrito;
            option.textContent = distrito.Distrito;
            distritoSelect.appendChild(option);
          });
        }
      });
    }
  });
};

const limpiarSelect = (selectElement) => {
  selectElement.innerHTML =
    "<option value='' disabled selected>Seleccione</option>";
};

const cargarSeccion = () => {
  distritoTitulo =
    distritoSelect.options[distritoSelect.selectedIndex].textContent;
  seleccion.distrito = distritoSelect.value;

  seccionSelect.innerHTML =
    "<option value='' disabled selected>Seleccione</option>";

  datosGenerales.forEach((eleccion) => {
    if (eleccion.IdEleccion == tipoEleccion) {
      eleccion.Cargos.forEach((cargo) => {
        if (cargo.IdCargo == seleccion.cargo) {
          cargo.Distritos.forEach((distrito) => {
            if (distrito.IdDistrito == seleccion.distrito) {
              distrito.SeccionesProvinciales.forEach((seccionProvincial) => {
                inputSeccionProvincial.id =
                  seccionProvincial.IDSeccionProvincial;
                seccionProvincial.Secciones.forEach((seccion) => {
                  const option = document.createElement("option");
                  option.value = seccion.IdSeccion;
                  option.textContent = seccion.Seccion;
                  seccionSelect.appendChild(option);
                });
              });
            }
          });
        }
      });
    }
  });
};
function agregarInforme() {
  const informe = {
    anio: periodosSelect.value,
    tipoRecuento: tipoRecuento,
    tipoEleccion: tipoEleccion,
    categoriaId: cargoSelect.value,
    distritoId: distritoSelect.value,
    seccionProvincialId: 0,
    seccionId: seccionSelect.value,
    circuitoId: "",
    mesaId: "",
    añoSeleccionado: seleccion.anio,
    cargoSeleccionado: seleccion.cargo,
    distritoSeleccionado: seleccion.distrito,
    seccionSeleccionada: seleccion.seccion,
  };

  const nuevoInforme = `${informe.anio}|${informe.tipoRecuento}|${informe.tipoEleccion}|${informe.categoriaId}|${informe.distritoId}|${informe.seccionProvincialId}|${informe.seccionId}|${informe.circuitoId}|${informe.mesaId}|${informe.añoSeleccionado}|${informe.cargoSeleccionado}|${informe.distritoSeleccionado}|${informe.seccionSeleccionada}`;

  let informes = localStorage.getItem("INFORMES")
    ? JSON.parse(localStorage.getItem("INFORMES"))
    : [];

  if (informes.includes(nuevoInforme)) {
    showAlert("warning", "El informe ya se encuentra añadido.");
  } else {
    informes.push(nuevoInforme);
    localStorage.setItem("INFORMES", JSON.stringify(informes));
    showAlert("success", "Informe agregado con éxito.");
  }
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarPeriodos();
});

btnInformes.addEventListener("click", agregarInforme);
periodosSelect.addEventListener("change", cargarCargos);
cargoSelect.addEventListener("change", cargarDistrito);
distritoSelect.addEventListener("change", cargarSeccion);
seccionSelect.addEventListener("change", () => {
  seccionTitulo =
    seccionSelect.options[seccionSelect.selectedIndex].textContent;
  btnFiltrar.disabled = false;
});

btnFiltrar.addEventListener("click", () => {
  seleccion.seccion = seccionSelect.value;
  console.log(seleccion);
  const camposIncompletos = Object.keys(seleccion).some(
    (key) => !seleccion[key]
  );

  if (camposIncompletos) {
    showAlert("warning", "Debe completar todos los campos.");
    return;
  }

  showAlert("success", "Consulta realizada correctamente.");
  console.log("seleccion", seleccion);
  filtrarResultados();
});
