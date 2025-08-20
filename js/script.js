document.addEventListener('DOMContentLoaded', function () {
    const sanRamonCoords = [-33.5345, -70.6206];
    const map = L.map('map').setView(sanRamonCoords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const recyclingIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063187.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    // Datos de ejemplo
    const recyclingPoints = [
        {
            id: 1,
            name: "Punto Limpio San Ramón",
            address: "Av. Concha y Toro 5720",
            comuna: "san-ramon",
            coords: [-33.5345, -70.6206],
            materials: ["Plástico", "Papel", "Vidrio"],
            schedule: "Lunes a Viernes 9:00-18:00",
            distance: "1.2 km"
        },
        {
            id: 2,
            name: "Reciclaje Electrónico",
            address: "Av. Santa Rosa 1234",
            comuna: "san-ramon",
            coords: [-33.5300, -70.6150],
            materials: ["Electrónicos", "Metal"],
            schedule: "Martes a Sábado 10:00-17:00",
            distance: "2.5 km"
        },
        {
            id: 3,
            name: "Centro de Acopio La Granja",
            address: "Av. San Francisco 8765",
            comuna: "la-granja",
            coords: [-33.5400, -70.6100],
            materials: ["Plástico", "Papel", "Vidrio", "Metal"],
            schedule: "Lunes a Domingo 8:00-20:00",
            distance: "3.1 km"
        },
        {
            id: 4,
            name: "Centro de Acopio Vate Vicente Huidobro",
            address: "Doñihue 2030, 8870093",
            comuna: "la-cisterna",
            coords: [-33.5350, -70.6250],
            materials: ["Plástico", "Papel", "Vidrio", "Metal"],
            schedule: "Lunes a Sábado 9:00-19:00",
            distance: "3.1 km"
        }
    ];

    const markers = [];
    recyclingPoints.forEach(point => {
        const marker = L.marker(point.coords, {
            icon: recyclingIcon,
            title: point.name
        }).addTo(map);

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

        marker.bindPopup(popupContent);
        marker.pointData = point;
        markers.push(marker);
    });

    function getBadgeClass(material) {
        const classes = {
            "Plástico": "badge-plastic",
            "Papel": "badge-paper",
            "Vidrio": "badge-glass",
            "Metal": "badge-metal",
            "Electrónicos": "badge-ewaste"
        };
        return classes[material] || "badge-secondary";
    }

    function loadNearbyLocations() {
        const nearbyList = document.getElementById('nearby-locations');
        nearbyList.innerHTML = '';

        recyclingPoints.forEach(point => {
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

            item.addEventListener('click', () => {
                map.setView(point.coords, 16);
                markers.find(m => m.pointData.id === point.id).openPopup();
            });

            nearbyList.appendChild(item);
        });
    }

    // Función para mostrar notificaciones toast
    function showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        const toastId = 'toast-' + Date.now();

        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.id = toastId;

        toastEl.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                `;

        toastContainer.appendChild(toastEl);

        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 5000
        });

        toast.show();

        // Eliminar el toast del DOM después de que se oculte
        toastEl.addEventListener('hidden.bs.toast', function () {
            toastEl.remove();
        });
    }

    // Configuración de los filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b =>
                b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');

            markers.forEach(marker => {
                if (filter === 'all') {
                    marker.addTo(map);
                } else {
                    if (marker.pointData.materials.includes(filter)) {
                        marker.addTo(map);
                    } else {
                        map.removeLayer(marker);
                    }
                }
            });

            filterLocationList();
        });
    });

    document.getElementById('comuna-filter').addEventListener('change', function () {
        const comuna = this.value;

        markers.forEach(marker => {
            if (comuna === 'all' || marker.pointData.comuna === comuna) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });

        filterLocationList();
    });

    // Función para filtrar la lista lateral
    function filterLocationList() {
        const materialFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        const comunaFilter = document.getElementById('comuna-filter').value;

        const nearbyList = document.getElementById('nearby-locations');
        nearbyList.innerHTML = '';

        recyclingPoints.forEach(point => {
            const passesMaterialFilter = materialFilter === 'all' || point.materials.includes(materialFilter);
            const passesComunaFilter = comunaFilter === 'all' || point.comuna === comunaFilter;

            if (passesMaterialFilter && passesComunaFilter) {
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

                item.addEventListener('click', () => {
                    map.setView(point.coords, 16);
                    markers.find(m => m.pointData.id === point.id).openPopup();
                });

                nearbyList.appendChild(item);
            }
        });
    }

    // Manejar el envío de formularios
    document.getElementById('addLocationForm').addEventListener('submit', function (e) {
        const submitBtn = document.getElementById('submitLocationBtn');
        const submitBtnText = document.getElementById('submitBtnText');
        const submitSpinner = document.getElementById('submitSpinner');

        submitBtn.disabled = true;
        submitBtnText.classList.add('d-none');
        submitSpinner.classList.remove('d-none');

        // Aquí se enviará el formulario a FormSubmit automáticamente
        // Mostramos mensaje de éxito después de un breve retraso
        setTimeout(() => {
            showToast('¡Punto registrado con éxito! Te contactaremos pronto.', 'success');

            // Ocultar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLocationModal'));
            modal.hide();

            // Mostrar sección de agradecimiento
            document.getElementById('gracias').style.display = 'block';
            document.getElementById('gracias').scrollIntoView({ behavior: 'smooth' });

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtnText.classList.remove('d-none');
            submitSpinner.classList.add('d-none');
        }, 2000);
    });

    document.getElementById('registrationForm').addEventListener('submit', function (e) {
        showToast('¡Registro exitoso! Bienvenido a GreenLink.', 'success');
    });

    // Botón de geolocalización
    document.getElementById('geo-btn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                map.setView([position.coords.latitude, position.coords.longitude], 15);
                showToast('Ubicación centrada en tu posición actual', 'info');
            }, () => {
                showToast('No se pudo obtener tu ubicación. Asegúrate de haber permitido el acceso.', 'danger');
            });
        } else {
            showToast('Tu navegador no soporta geolocalización.', 'danger');
        }
    });

    // Cargar lista de puntos cercanos
    loadNearbyLocations();

    // Animación de estadísticas
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = id === 'recycled-count' || id === 'co2-count' ?
                value.toFixed(1) : value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue('users-count', 0, 1256, 2000);
                animateValue('locations-count', 0, 87, 1500);
                animateValue('recycled-count', 0, 42.5, 2000);
                animateValue('co2-count', 0, 98, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(document.getElementById('estadisticas'));

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});