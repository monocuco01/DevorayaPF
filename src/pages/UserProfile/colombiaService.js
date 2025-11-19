import axios from "axios";

const API_URL = "https://api-colombia.com/api/v1/Department";

export const getDepartamentos = async () => {
  console.log("🔵 CARGANDO DEPARTAMENTOS...");

  try {
    const res = await axios.get(API_URL, {
      headers: {
        "Content-Type": "application/json",
      }
    });

    console.log("🟢 DEPARTAMENTOS RECIBIDOS:", res.data);
    return res.data;
  } catch (error) {
    console.log("🔴 ERROR AL CARGAR DEPARTAMENTOS:", error.message);
    return [];
  }
};

export const getCiudades = async (id) => {
  console.log("🟣 CARGANDO CIUDADES DEL DEP:", id);

  try {
    const res = await axios.get(`${API_URL}/${id}`);
    console.log("🟢 CIUDADES RECIBIDAS:", res.data.cities);

    return res.data.cities || [];
  } catch (error) {
    console.log("🔴 ERROR AL CARGAR CIUDADES:", error.message);
    return [];
  }
};
