// Cambiar entre modo claro y oscuro
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');

    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = 'Cambiar a modo claro';
    } else {
        themeToggle.textContent = 'Cambiar a modo oscuro';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let logo = document.getElementById('logo');
    let currentTheme = prefersDarkScheme.matches ? "dark" : "light";

    // Asignar logos del archivo JSON
    let logos = {
        light: '',  // El logo claro se establecerá más tarde
        dark: ''    // El logo oscuro se establecerá más tarde
    };

    // Función para cargar el JSON y aplicar el logo correcto
    fetch('glosario.json')
    .then(response => response.json())
    .then(data => {
        renderHeader(data); // Renderizar título, descripción y logo desde JSON
        renderGlosario(data); // Renderizar los términos desde el inicio
        createCategoryButtons(data); // Crear los botones de categorías
        logos.light = data.logo;
        logos.dark = data.logo_dark;

        // Establecemos el logo inicial de acuerdo al tema actual
        if (currentTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeToggle.checked = true;
            logo.src = logos.dark;  // Logo oscuro
        } else {
            document.body.classList.add("light-mode");
            logo.src = logos.light;  // Logo claro
        }

        // Renderizar título y descripción
        document.getElementById('header-title').innerText = data.titulo;
        document.getElementById('header-description').innerText = data.descripcion;
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

    // Cambiar el tema cuando el toggle es activado
    themeToggle.addEventListener('change', function() {
        if (themeToggle.checked) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
            logo.src = logos.dark;  // Cambiar al logo oscuro
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
            logo.src = logos.light;  // Cambiar al logo claro
        }
    });
});


// Renderizar encabezado
function renderHeader(data) {
    document.getElementById('header-title').innerText = data.titulo;
    document.getElementById('header-description').innerText = data.descripcion;
    document.getElementById('dynamic-title').innerText = data.titulo;
    document.getElementById('logo').src = data.logo; // Cargar el logo dinámicamente
}

// Renderizar términos de riesgos y oportunidades
function renderGlosario(data) {
    const glosarioSection = document.getElementById('glosario');
    glosarioSection.innerHTML = ''; // Limpiar la sección del glosario

    // Recorremos cada temática usando Object.keys para obtener los nombres de las temáticas
    Object.keys(data.tematicas).forEach(tematicaNombre => {
        const tematica = data.tematicas[tematicaNombre];  // Obtenemos el objeto tematica

        // Crear un contenedor para la temática
        const tematicaDiv = document.createElement('div');
        tematicaDiv.className = 'tematica';
        tematicaDiv.innerHTML = `<h2 style="color: ${tematica.color}">${tematicaNombre}</h2>`;

        // Recorremos los términos de la temática
        tematica.terminos.forEach(termino => {
            const termDiv = document.createElement('div');
            termDiv.className = 'term';
            termDiv.dataset.tematica = tematicaNombre.toLowerCase();
            termDiv.style.borderLeftColor = tematica.color; // Aplicar color de la temática
            termDiv.innerHTML = `<div class="term-header" style="color: ${tematica.color}">${termino.termino}</div>
                                 <p>${termino.descripcion}</p>`;
            termDiv.onclick = function() {
                openModal(termino.termino, termino.descripcion, tematicaNombre, tematica.color);
            };
            tematicaDiv.appendChild(termDiv);
        });

        glosarioSection.appendChild(tematicaDiv);
    });
}





// Crear botones de categorías con colores
function createCategoryButtons(data) {
    const categoryNav = document.getElementById('category-nav');
    categoryNav.innerHTML = ''; // Limpiar botones previos

    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.innerHTML = 'Todos';
    allBtn.addEventListener('click', () => filterByCategory(''));
    categoryNav.appendChild(allBtn);

    // Crear botones para cada temática
    Object.keys(data.tematicas).forEach(tematicaNombre => {
        const tematica = data.tematicas[tematicaNombre];
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'category-btn';
        categoryBtn.style.borderColor = tematica.color; // Aplicar color al borde del botón
        categoryBtn.innerHTML = tematicaNombre.charAt(0).toUpperCase() + tematicaNombre.slice(1); // Capitalizar la primera letra
        categoryBtn.addEventListener('click', () => filterByCategory(tematicaNombre.toLowerCase())); // Enviar temática en minúsculas
        categoryNav.appendChild(categoryBtn);
    });
}



// Filtrar términos por categoría
function filterByCategory(category) {
    const tematicas = document.querySelectorAll('#glosario .tematica'); // Seleccionar todas las temáticas
    const categoryBtns = document.querySelectorAll('.category-btn');

    // Resaltar botón activo
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    if (category === '') {
        document.querySelector('.category-btn').classList.add('active'); // Resalta "Todos"
    } else {
        categoryBtns.forEach(btn => {
            if (btn.innerHTML.toLowerCase() === category) {
                btn.classList.add('active');
                btn.style.backgroundColor = btn.style.borderColor;
            } else {
                btn.style.backgroundColor = ''; // Restablecer otros botones
            }
        });
    }

    // Filtrar temáticas y términos
    tematicas.forEach(tematica => {
        const terms = tematica.querySelectorAll('.term'); // Seleccionar los términos dentro de la temática
        let hasVisibleTerms = false; // Bandera para saber si hay términos visibles en esta temática

        terms.forEach(term => {
            if (category === '' || term.dataset.tematica === category) {
                term.style.display = 'block';
                term.classList.add('fade-in');
                hasVisibleTerms = true; // Hay al menos un término visible en esta temática
            } else {
                term.style.display = 'none';
            }
        });

        // Mostrar u ocultar la temática según si tiene términos visibles
        if (hasVisibleTerms || category === '') {
            tematica.style.display = 'block'; // Mostrar la temática
        } else {
            tematica.style.display = 'none'; // Ocultar la temática
        }
    });
}





// Buscar términos
function filterTerms() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const tematicas = document.querySelectorAll('#glosario .tematica'); // Seleccionar todas las temáticas

    // Detectar la categoría seleccionada (si hay alguna)
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const selectedCategory = activeCategoryBtn && activeCategoryBtn.innerHTML.toLowerCase() !== 'todos'
        ? activeCategoryBtn.innerHTML.toLowerCase()
        : ''; // Si no hay categoría seleccionada o es "Todos", seleccionamos todos

    // Filtrar temáticas y términos
    tematicas.forEach(tematica => {
        const terms = tematica.querySelectorAll('.term'); // Seleccionar los términos dentro de la temática
        let hasVisibleTerms = false; // Bandera para saber si hay términos visibles en esta temática

        terms.forEach(term => {
            const termText = term.innerText.toLowerCase();
            const termCategory = term.dataset.tematica.toLowerCase();

            // Mostrar solo los términos de la categoría seleccionada y que coincidan con la búsqueda
            if ((selectedCategory === '' || termCategory === selectedCategory) && termText.includes(searchInput)) {
                term.style.display = 'block';
                term.classList.add('fade-in');
                hasVisibleTerms = true; // Hay al menos un término visible en esta temática
            } else {
                term.style.display = 'none';
            }
        });

        // Mostrar u ocultar la temática según si tiene términos visibles
        if (hasVisibleTerms || (searchInput === '' && selectedCategory === '')) {
            tematica.style.display = 'block'; // Mostrar la temática
        } else {
            tematica.style.display = 'none'; // Ocultar la temática
        }
    });
}


// Funciones para el modal
// Función para abrir el modal y mostrar el término seleccionado
function openModal(termTitle, termDescription, termTematica, tematicaColor) {
    const modal = document.getElementById('termModal');
    const modalTitle = document.getElementById('modal-term-title');
    const modalDescription = document.getElementById('modal-term-description');
    const modalTematica = document.getElementById('modal-term-tematica');

    // Mostrar el título y la descripción del término
    modalTitle.innerText = termTitle;
    modalDescription.innerText = termDescription;

    // Mostrar la temática con el color correspondiente
    modalTematica.innerText = `Temática: ${termTematica}`;
    modalTematica.style.backgroundColor = tematicaColor;
    modalTematica.style.color = "#fff"; // Texto blanco por defecto

    // Mostrar el modal con una transición elegante
    modal.classList.add('open');
    modal.style.display = "flex";
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('termModal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // Espera a que la animación se complete
}

document.querySelector('.close').onclick = closeModal;

window.onclick = function(event) {
    const modal = document.getElementById('termModal');
    if (event.target === modal) {
        closeModal();
    }
};

