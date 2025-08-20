// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Coordenadas de San Ramón (latitud, longitud)
    const sanRamonCoords = [-33.5345, -70.6206];
    
    // Inicializa el mapa centrado en San Ramón con nivel de zoom 14
    const map = L.map('map').setView(sanRamonCoords, 14);
    
    // Añade la capa de tiles de OpenStreetMap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Define un icono personalizado para los puntos de reciclaje
    const recyclingIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063187.png', // URL del icono
        iconSize: [32, 32],      // Tamaño del icono
        iconAnchor: [16, 32],    // Punto de anclaje del icono
        popupAnchor: [0, -32]    // Punto de anclaje del popup
    });

    // Datos de ejemplo de puntos de reciclaje
    const recyclingPoints = [
        {
            id: 1,
            name: "Punto Limpio San Ramón",
            address: "Av. Concha y Toro 5720",
            comuna: "san-ramon",
            coords: [-33.5345, -70.6206], // Coordenadas (lat, lng)
            materials: ["Plástico", "Papel", "Vidrio"], // Materiales aceptados
            schedule: "Lunes a Viernes 9:00-18:00", // Horario
            distance: "1.2 km" // Distancia (simulada)
        },
        // ... más puntos de reciclaje
    ];

    // Array para almacenar los marcadores
    const markers = [];
    
    // Itera sobre cada punto de reciclaje
    recyclingPoints.forEach(point => {
        // Crea un marcador para el punto
        const marker = L.marker(point.coords, {
            icon: recyclingIcon, // Usa el icono personalizado
            title: point.name    // Texto al pasar el cursor
        }).addTo(map);          // Añade el marcador al mapa

        // Contenido HTML para el popup del marcador
        const popupContent = `
            <h6 class="mb-1">${point.name}</h6>
            <p class="mb-2"><small>${point.address}</small></p>
            <p class="mb-1"><strong>Horario:</strong> ${point.schedule}</p>
            <div class="d-flex flex-wrap gap-1 mt-2">
                ${point.materials.map(material =>
                    `<span class="material-badge ${getBadgeClass(material)}">${material}</span>`
                ).join('')}
            </div>
        `;

        // Asocia el popup al marcador
        marker.bindPopup(popupContent);

        // Almacena los datos del punto en el marcador
        marker.pointData = point;
        
        // Añade el marcador al array
        markers.push(marker);
    });

    // Función para obtener la clase CSS según el material
    function getBadgeClass(material) {
        const classes = {
            "Plástico": "badge-plastic",
            "Papel": "badge-paper",
            "Vidrio": "badge-glass",
            "Metal": "badge-metal",
            "Electrónicos": "badge-ewaste"
        };
        return classes[material] || "badge-secondary"; // Clase por defecto
    }

    // Carga los puntos cercanos en la lista lateral
    function loadNearbyLocations() {
        const nearbyList = document.getElementById('nearby-locations');
        nearbyList.innerHTML = ''; // Limpia la lista

        recyclingPoints.forEach(point => {
            // Crea un elemento de lista para cada punto
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${point.name}</h6>
                    <small class="text-muted">${point.distance}</small>
                </div>
                <p class="mb-1 small">${point.address}</p>
                <div class="d-flex flex-wrap gap-1 mt-1">
                    ${point.materials.map(material =>
                        `<span class="material-badge ${getBadgeClass(material)}">${material}</span>`
                    ).join('')}
                </div>
            `;

            // Añade evento click para centrar el mapa en el punto
            item.addEventListener('click', () => {
                map.setView(point.coords, 16); // Centra y acerca
                markers.find(m => m.pointData.id === point.id).openPopup(); // Abre popup
            });

            nearbyList.appendChild(item); // Añade a la lista
        });
    }

    // Filtrado por material (botones)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Remueve la clase active de todos los botones
            document.querySelectorAll('.filter-btn').forEach(b =>
                b.classList.remove('active'));
            
            // Añade active al botón clickeado
            this.classList.add('active');
            
            // Obtiene el filtro seleccionado
            const filter = this.getAttribute('data-filter');

            // Filtra los marcadores
            markers.forEach(marker => {
                if (filter === 'all') {
                    marker.addTo(map); // Muestra todos
                } else {
                    const materials = marker.pointData.materials.map(m => m.toLowerCase());
                    if (materials.includes(filter)) {
                        marker.addTo(map); // Muestra si coincide
                    } else {
                        map.removeLayer(marker); // Oculta si no coincide
                    }
                }
            });
        });
    });

    // Filtrado por comuna (select)
    document.getElementById('comuna-filter').addEventListener('change', function () {
        const comuna = this.value; // Obtiene la comuna seleccionada

        markers.forEach(marker => {
            if (comuna === 'all' || marker.pointData.comuna === comuna) {
                marker.addTo(map); // Muestra si coincide
            } else {
                map.removeLayer(marker); // Oculta si no coincide
            }
        });
    });

    // Carga inicial de la lista de puntos
    loadNearbyLocations();

    // Animación de valores en la sección de estadísticas
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            // Calcula el progreso de la animación
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Calcula el valor actual
            const value = Math.floor(progress * (end - start) + start);
            // Formatea el valor según el tipo
            obj.innerHTML = id === 'recycled-count' || id === 'co2-count' ?
                value.toFixed(1) : value.toLocaleString();
            // Continúa la animación si no ha terminado
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        // Inicia la animación
        window.requestAnimationFrame(step);
    }

    // Observer para animar las estadísticas cuando son visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Anima cada contador
                animateValue('users-count', 0, 1250, 2000);
                animateValue('locations-count', 0, 87, 1500);
                animateValue('recycled-count', 0, 42.5, 2000);
                animateValue('co2-count', 0, 98, 2000);
                observer.unobserve(entry.target); // Deja de observar
            }
        });
    }, { threshold: 0.5 }); // Se activa cuando el 50% es visible

    observer.observe(document.getElementById('estadisticas'));

    // Manejo del formulario de registro
    document.getElementById('registrationForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío tradicional
        alert('¡Gracias por registrarte en GreenLink! Te hemos enviado un correo de confirmación.');
        this.reset(); // Limpia el formulario
    });

    // Manejo del formulario para añadir ubicaciones
    document.getElementById('submitLocationBtn').addEventListener('click', function () {
        const form = document.getElementById('addLocationForm');
        if (form.checkValidity()) { // Verifica validez
            alert('¡Gracias por contribuir! Tu punto de reciclaje será revisado y publicado pronto.');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLocationModal'));
            modal.hide(); // Cierra el modal
            form.reset(); // Limpia el formulario
        } else {
            form.reportValidity(); // Muestra errores de validación
        }
    });

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Evita el comportamiento por defecto
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Scroll suave hacia el objetivo
                window.scrollTo({
                    top: target.offsetTop - 70, // Ajusta para el header fijo
                    behavior: 'smooth'
                });
            }
        });
    });

    // Botón para centrar el mapa en la ubicación del usuario
    if (navigator.geolocation) {
        const geoBtn = document.createElement('button');
        geoBtn.className = 'btn btn-outline-primary btn-sm ms-2';
        geoBtn.innerHTML = '<i class="fas fa-location-arrow me-1"></i>Mi ubicación';
        geoBtn.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(position => {
                // Centra el mapa en la ubicación del usuario
                map.setView([position.coords.latitude, position.coords.longitude], 15);
            }, () => {
                alert('No se pudo obtener tu ubicación. Asegúrate de haber permitido el acceso.');
            });
        });

        // Añade el botón al contenedor del mapa
        document.querySelector('.map-container').appendChild(geoBtn);
    }
});