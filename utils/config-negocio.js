// utils/config-negocio.js - Multi-tenant
// CLIENTE: Nails Gretel

console.log('config-negocio.js cargado');

const NEGOCIO_ID_POR_DEFECTO = '10ba1f00-1e17-4009-a459-2fff39bfb8fb';
window.NEGOCIO_ID_POR_DEFECTO = NEGOCIO_ID_POR_DEFECTO;

window.getNegocioId = function() {
    return NEGOCIO_ID_POR_DEFECTO;
};

window.getNegocioIdFromConfig = function() {
    return NEGOCIO_ID_POR_DEFECTO;
};

let configCache = null;
let ultimaActualizacion = 0;
const CACHE_DURATION = 2 * 60 * 1000;

function getNegocioId() {
    const localId = localStorage.getItem('negocioId');
    if (localId) {
        console.log('Usando negocioId de localStorage:', localId);
        return localId;
    }
    console.log('Usando negocioId por defecto:', NEGOCIO_ID_POR_DEFECTO);
    return NEGOCIO_ID_POR_DEFECTO;
}

window.cargarConfiguracionNegocio = async function(forceRefresh = false) {
    const negocioId = getNegocioId();
    if (!negocioId) {
        console.error('No hay negocioId disponible');
        return null;
    }

    if (!forceRefresh && configCache && (Date.now() - ultimaActualizacion) < CACHE_DURATION) {
        console.log('Usando cache de configuracion');
        return configCache;
    }

    try {
        console.log('Cargando configuracion del negocio desde Supabase...');
        console.log('ID del negocio:', negocioId);
        const url = `${window.SUPABASE_URL}/rest/v1/negocios?id=eq.${negocioId}&select=*`;
        const response = await fetch(url, {
            headers: {
                'apikey': window.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Error response:', await response.text());
            return null;
        }

        const data = await response.json();
        configCache = data[0] || null;
        ultimaActualizacion = Date.now();

        if (configCache) {
            console.log('Configuracion cargada:', configCache.nombre);
            if (!localStorage.getItem('negocioId')) {
                localStorage.setItem('negocioId', negocioId);
            }
        } else {
            console.log('No se encontro configuracion para el negocio');
        }

        return configCache;
    } catch (error) {
        console.error('Error cargando configuracion:', error);
        return null;
    }
};

window.getNombreNegocio = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.nombre || 'Nails Gretel';
};

window.getTelefonoDuenno = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.telefono || '52847900';
};

window.getEmailNegocio = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.email || 'benitezgretel80@gmail.com';
};

window.getInstagram = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.instagram || '';
};

window.getFacebook = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.facebook || '';
};

window.getHorarioAtencion = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.horario_atencion || '';
};

window.getMensajeBienvenida = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.mensaje_bienvenida || '¡Bienvenida a Nails Gretel!';
};

window.getMensajeConfirmacion = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.mensaje_confirmacion || 'Tu turno ha sido reservado con éxito';
};

window.getNtfyTopic = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.ntfy_topic || 'nails-gretel';
};

window.getRequiereAnticipo = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.requiere_anticipo || false;
};

window.negocioConfigurado = async function() {
    const config = await window.cargarConfiguracionNegocio();
    return config?.configurado || false;
};

setTimeout(async () => {
    console.log('Precargando configuracion automatica...');
    await window.cargarConfiguracionNegocio();
}, 500);

console.log('config-negocio.js listo para Nails Gretel');
console.log('ID configurado:', NEGOCIO_ID_POR_DEFECTO);
