/**
 * app.js
 * Lógica principal de la aplicación Planifica+
 * Este script maneja la navegación, interactividad del Kanban y modales.
 */
document.addEventListener("DOMContentLoaded", function () {
  // =================================================================
  // 1. DECLARACIÓN DE ELEMENTOS DEL DOM
  // =================================================================
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const mainContent = document.querySelector(".main-content");
  const contentViews = mainContent.querySelectorAll(
    ':scope > div[id$="-view"]'
  );
  const projectCards = document.querySelectorAll(".project-card");
  const projectDetailTitle = document.getElementById("kanban-title");
  const backToProjectsButton = document.getElementById("back-to-projects");
  const taskModalElement = document.getElementById("taskModal");
  const taskCards = document.querySelectorAll(".task-card");
  const kanbanColumns = document.querySelectorAll(".kanban-column .card-body");

  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // --- ESTADO Y FLAGS ---
  let chartsRendered = false; // Flag para asegurar que los gráficos se rendericen solo una vez

  // --- FUNCIONES DE RENDERIZADO ---

  /**
   * Renderiza los gráficos de la sección de analíticas usando Chart.js
   */
  function renderAnalyticsCharts() {
    // Solo renderizar si no se han renderizado antes
    if (chartsRendered) return;

    // Verificar que los elementos canvas existan
    const progressCanvas = document.getElementById("projectProgressChart");
    const distributionCanvas = document.getElementById("taskDistributionChart");

    if (!progressCanvas || !distributionCanvas) {
      console.warn("Canvas elements not found for charts");
      return;
    }

    // Gráfico de Barras: Progreso de Proyectos
    const progressCtx = progressCanvas.getContext("2d");
    new Chart(progressCtx, {
      type: "bar",
      data: {
        labels: [
          "Proyecto Alpha",
          "E-commerce Beta",
          "App Móvil",
          "Marketing Q3",
        ],
        datasets: [
          {
            label: "% Completado",
            data: [75, 45, 95, 60],
            backgroundColor: [
              "rgba(40, 167, 69, 0.7)", // --color-success
              "rgba(255, 193, 7, 0.7)", // --color-warning
              "rgba(48, 1, 255, 0.7)", // --color-primary
              "rgba(150, 78, 249, 0.7)", // --color-accent
            ],
            borderColor: [
              "rgb(40, 167, 69)",
              "rgb(255, 193, 7)",
              "rgb(48, 1, 255)",
              "rgb(150, 78, 249)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    // Gráfico de Dona: Distribución de Tareas
    const distributionCtx = distributionCanvas.getContext("2d");
    new Chart(distributionCtx, {
      type: "doughnut",
      data: {
        labels: ["Pendiente", "En Progreso", "En Revisión", "Completado"],
        datasets: [
          {
            label: "Tareas",
            data: [18, 9, 5, 42],
            backgroundColor: [
              "rgb(108, 117, 125)", // gris
              "rgb(48, 1, 255)", // --color-primary
              "rgb(255, 193, 7)", // --color-warning
              "rgb(40, 167, 69)", // --color-success
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });

    chartsRendered = true;
  }

  // =================================================================
  // 2. LÓGICA DE NAVEGACIÓN Y VISUALIZACIÓN DE VISTAS
  // =================================================================

  /**
   * Oculta todas las vistas principales y muestra solo la que tiene el ID proporcionado.
   * @param {string} viewId - El ID de la vista a mostrar (e.g., 'dashboard-view').
   */
  const showView = (viewId) => {
    contentViews.forEach((view) => {
      if (view) view.style.display = "none";
    });
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
      viewToShow.style.display = "block";

      // Renderizar gráficos si estamos en la vista de reportes
      if (viewId === "reportes-view" && !chartsRendered) {
        // Pequeño delay para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
          renderAnalyticsCharts();
        }, 100);
      }
    } else {
      console.error(`Error: No se encontró la vista con el ID: ${viewId}`);
    }
  };

  // Navegación con la barra lateral
  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const targetViewId = this.getAttribute("href").substring(1);
      navLinks.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");
      showView(targetViewId);
    });
  });

  // Navegación de la lista de proyectos a la vista detallada
  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const projectName = card.querySelector(".project-title").textContent;
      if (projectDetailTitle) {
        projectDetailTitle.textContent = `Proyecto: ${projectName}`;
      }
      showView("kanban-view");
    });
  });

  // Botón para volver de la vista detallada a la lista de proyectos
  if (backToProjectsButton) {
    backToProjectsButton.addEventListener("click", () => {
      showView("proyectos-view");
    });
  }

  // =================================================================
  // 3. LÓGICA DE COMPONENTES INTERACTIVOS
  // =================================================================

  // Lógica para el Modal de Tareas
  if (taskModalElement) {
    taskModalElement.addEventListener("show.bs.modal", function (event) {
      const card = event.relatedTarget;
      if (!card) return;
      const taskTitle = card.querySelector(".card-title")?.textContent;
      const modalTitle = taskModalElement.querySelector(".modal-title");
      if (taskTitle && modalTitle) {
        modalTitle.textContent = `Detalles: ${taskTitle}`;
      }
    });
  }

  // Funcionalidad de Arrastrar y Soltar (Drag & Drop) para el Kanban
  let draggedElement = null;
  taskCards.forEach((card) => {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      draggedElement = e.target.closest(".task-card");
      setTimeout(() => {
        if (draggedElement) draggedElement.style.opacity = "0.5";
      }, 0);
    });

    card.addEventListener("dragend", () => {
      if (draggedElement) draggedElement.style.opacity = "1";
      draggedElement = null;
    });
  });

  kanbanColumns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.style.backgroundColor = "#f0f0ff";
    });

    column.addEventListener("dragleave", () => {
      column.style.backgroundColor = "";
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.style.backgroundColor = "";
      if (draggedElement) {
        column.appendChild(draggedElement);
        console.log(
          `Tarea '${
            draggedElement.querySelector(".card-title").textContent
          }' movida a la columna '${
            column.previousElementSibling.textContent
          }'.`
        );
      }
    });
  });

  // =================================================================
  // 4. LÓGICA DE INICIALIZACIÓN Y ATAJOS
  // =================================================================

  // Atajos de teclado para navegación
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      const shortcutKey = parseInt(e.key);
      if (
        !isNaN(shortcutKey) &&
        shortcutKey >= 1 &&
        shortcutKey <= navLinks.length
      ) {
        e.preventDefault();
        const targetLink = navLinks[shortcutKey - 1];
        if (targetLink) {
          targetLink.click();
        }
      }
    }
  });

  // Establece la vista inicial al cargar la página
  const initialActiveLink = document.querySelector(".sidebar .nav-link.active");
  if (initialActiveLink) {
    const initialViewId = initialActiveLink.getAttribute("href").substring(1);
    showView(initialViewId);
  } else if (contentViews.length > 0) {
    // Si no hay ninguno activo, muestra el primero (Dashboard por defecto)
    showView("dashboard-view");
  }

  // LÓGICA PARA EL MODAL DE VISTA DETALLADA DE PUBLICACIÓN
  const viewPostModalElement = document.getElementById("viewPostModal");
  if (viewPostModalElement) {
    viewPostModalElement.addEventListener("show.bs.modal", function (event) {
      // Elemento que activó el modal (la tarjeta de previsualización)
      const previewItem = event.relatedTarget;

      // Extraer datos del elemento usando data-attributes
      const network = previewItem.dataset.postNetwork;
      const text = previewItem.dataset.postText;
      const datetime = previewItem.dataset.postDatetime;
      const imageUrl = previewItem.dataset.postImage;

      // Obtener elementos del modal
      const modalTitleIcon = viewPostModalElement.querySelector(
        "#viewPostModalLabel .bi"
      );
      const modalTitleName = viewPostModalElement.querySelector(
        "#viewPostNetworkName"
      );
      const modalContent =
        viewPostModalElement.querySelector("#viewPostContent");
      const modalImageContainer = viewPostModalElement.querySelector(
        "#viewPostImageContainer"
      );
      const modalImage = viewPostModalElement.querySelector("#viewPostImage");
      const modalDateTime =
        viewPostModalElement.querySelector("#viewPostDateTime");

      // Poblar el modal con los datos
      modalContent.textContent = text;

      // Formatear la fecha para que sea más legible
      const date = new Date(datetime);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      modalDateTime.textContent = date.toLocaleDateString("es-ES", options);

      // Configurar el título (ícono y nombre)
      if (network === "instagram") {
        modalTitleIcon.className = "bi bi-instagram me-2";
        modalTitleName.textContent = "Instagram";
      } else if (network === "facebook") {
        modalTitleIcon.className = "bi bi-facebook me-2";
        modalTitleName.textContent = "Facebook";
      } else if (network === "linkedin") {
        modalTitleIcon.className = "bi bi-linkedin me-2";
        modalTitleName.textContent = "LinkedIn";
      }

      // Mostrar la imagen si la URL existe
      if (imageUrl) {
        modalImage.src = imageUrl;
        modalImageContainer.style.display = "block";
      } else {
        modalImageContainer.style.display = "none";
      }
    });
  }

  // =================================================================
  // LÓGICA PARA EL MODAL DE DETALLES DEL PROYECTO (MEJORADA)
  // =================================================================
  const projectDetailModalEl = document.getElementById("projectDetailModal");
  let modalChartInstance = null; // Variable para guardar la instancia del gráfico del modal

  if (projectDetailModalEl) {
    projectDetailModalEl.addEventListener("show.bs.modal", function (event) {
      const trigger = event.relatedTarget; // El elemento que activó el modal

      // Buscar la fila de la tabla que contiene los datos
      let tableRow = trigger.closest("tr");

      // Si no encontramos una fila (caso de los project-cards), buscar la card
      if (!tableRow) {
        const projectCard = trigger.closest(".project-card");
        if (projectCard) {
          // Para las tarjetas de proyecto, usar datos predeterminados
          populateModalWithDefaultData(
            projectCard.querySelector(".project-title").textContent
          );
          return;
        }
      }

      // Verificar que tenemos una fila con datos
      if (!tableRow || !tableRow.dataset.projectName) {
        console.error("No se encontraron datos del proyecto");
        return;
      }

      // Extraer datos del proyecto desde los data-attributes
      const projectName = tableRow.dataset.projectName;
      const tasksCompleted = parseInt(tableRow.dataset.tasksCompleted);
      const tasksTotal = parseInt(tableRow.dataset.tasksTotal);
      const budgetUsed = parseFloat(tableRow.dataset.budgetUsed);
      const budgetTotal = parseFloat(tableRow.dataset.budgetTotal);

      let teamData, chartData;

      try {
        teamData = JSON.parse(tableRow.dataset.team);
        chartData = JSON.parse(tableRow.dataset.chartData);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
        return;
      }

      // Actualizar título del modal
      const modalTitle = projectDetailModalEl.querySelector(".modal-title");
      modalTitle.textContent = `Detalles del: ${projectName}`;

      // Poblar KPIs del proyecto en el modal
      const kpiContainer = projectDetailModalEl.querySelector("#project-kpis");
      kpiContainer.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
              <span><i class="bi bi-check2-circle me-2"></i>Tareas Completadas</span>
              <span class="fw-bold">${tasksCompleted} / ${tasksTotal}</span>
          </div>
          <div class="progress mb-3" style="height: 5px;">
              <div class="progress-bar" role="progressbar" style="width: ${
                (tasksCompleted / tasksTotal) * 100
              }%" aria-valuenow="${(tasksCompleted / tasksTotal) * 100}"></div>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
              <span><i class="bi bi-cash-coin me-2"></i>Presupuesto Usado</span>
              <span class="fw-bold">$${budgetUsed.toLocaleString()} / $${budgetTotal.toLocaleString()}</span>
          </div>
          <div class="progress" style="height: 5px;">
              <div class="progress-bar bg-warning" role="progressbar" style="width: ${
                (budgetUsed / budgetTotal) * 100
              }%" aria-valuenow="${(budgetUsed / budgetTotal) * 100}"></div>
          </div>
      `;

      // Poblar lista de actividad del equipo
      const teamListContainer = projectDetailModalEl.querySelector(
        "#team-activity-list"
      );
      teamListContainer.innerHTML = ""; // Limpiar contenido anterior
      teamData.forEach((member) => {
        teamListContainer.innerHTML += `
              <div class="list-group-item d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                      <img src="${member.avatar}" class="rounded-circle me-3" style="width: 40px; height: 40px;">
                      <div>
                          <h6 class="mb-0">${member.name}</h6>
                      </div>
                  </div>
                  <div>
                      <span class="badge text-bg-primary me-2">${member.tasks} Tareas</span>
                      <span class="badge text-bg-secondary">${member.hours} Horas</span>
                  </div>
              </div>
          `;
      });

      // Renderizar gráfico del modal
      const modalChartCtx = document.getElementById("modalProjectChart");
      if (modalChartCtx) {
        if (modalChartInstance) {
          modalChartInstance.destroy(); // Destruir gráfico anterior para evitar conflictos
        }
        modalChartInstance = new Chart(modalChartCtx.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: ["Pendiente", "En Progreso", "En Revisión", "Completado"],
            datasets: [
              {
                data: chartData,
                backgroundColor: [
                  "rgb(108, 117, 125)",
                  "rgb(48, 1, 255)",
                  "rgb(255, 193, 7)",
                  "rgb(40, 167, 69)",
                ],
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          },
        });
      }
    });
  }

  /**
   * Función para poblar el modal con datos predeterminados (para project-cards)
   */
  function populateModalWithDefaultData(projectName) {
    // Datos predeterminados para las tarjetas de proyecto
    const defaultData = {
      "Proyecto Alpha": {
        tasksCompleted: 12,
        tasksTotal: 16,
        budgetUsed: 8500,
        budgetTotal: 12000,
        team: [
          {
            name: "Ana García",
            avatar: "https://placehold.co/40x40/964ef9/white?text=A",
            tasks: 8,
            hours: 42,
          },
          {
            name: "Carlos López",
            avatar: "https://placehold.co/40x40/ffc107/white?text=C",
            tasks: 4,
            hours: 28,
          },
        ],
        chartData: [3, 1, 1, 12],
      },
    };

    const data = defaultData[projectName] || defaultData["Proyecto Alpha"];

    // Actualizar título del modal
    const modalTitle = projectDetailModalEl.querySelector(".modal-title");
    modalTitle.textContent = `Detalles del: ${projectName}`;

    // Poblar KPIs
    const kpiContainer = projectDetailModalEl.querySelector("#project-kpis");
    kpiContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span><i class="bi bi-check2-circle me-2"></i>Tareas Completadas</span>
            <span class="fw-bold">${data.tasksCompleted} / ${
      data.tasksTotal
    }</span>
        </div>
        <div class="progress mb-3" style="height: 5px;">
            <div class="progress-bar" role="progressbar" style="width: ${
              (data.tasksCompleted / data.tasksTotal) * 100
            }%" aria-valuenow="${
      (data.tasksCompleted / data.tasksTotal) * 100
    }"></div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span><i class="bi bi-cash-coin me-2"></i>Presupuesto Usado</span>
            <span class="fw-bold">$${data.budgetUsed.toLocaleString()} / $${data.budgetTotal.toLocaleString()}</span>
        </div>
        <div class="progress" style="height: 5px;">
            <div class="progress-bar bg-warning" role="progressbar" style="width: ${
              (data.budgetUsed / data.budgetTotal) * 100
            }%" aria-valuenow="${
      (data.budgetUsed / data.budgetTotal) * 100
    }"></div>
        </div>
    `;

    // Poblar equipo
    const teamListContainer = projectDetailModalEl.querySelector(
      "#team-activity-list"
    );
    teamListContainer.innerHTML = "";
    data.team.forEach((member) => {
      teamListContainer.innerHTML += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${member.avatar}" class="rounded-circle me-3" style="width: 40px; height: 40px;">
                    <div>
                        <h6 class="mb-0">${member.name}</h6>
                    </div>
                </div>
                <div>
                    <span class="badge text-bg-primary me-2">${member.tasks} Tareas</span>
                    <span class="badge text-bg-secondary">${member.hours} Horas</span>
                </div>
            </div>
        `;
    });

    // Renderizar gráfico
    const modalChartCtx = document.getElementById("modalProjectChart");
    if (modalChartCtx) {
      if (modalChartInstance) {
        modalChartInstance.destroy();
      }
      modalChartInstance = new Chart(modalChartCtx.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Pendiente", "En Progreso", "En Revisión", "Completado"],
          datasets: [
            {
              data: data.chartData,
              backgroundColor: [
                "rgb(108, 117, 125)",
                "rgb(48, 1, 255)",
                "rgb(255, 193, 7)",
                "rgb(40, 167, 69)",
              ],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        },
      });
    }
  }


  // =================================================================
// CRM SYSTEM FUNCTIONS
// =================================================================

// Base de datos simulada del CRM
let crmDatabase = {
  contacts: [
    {
      id: '001',
      name: 'María González',
      email: 'maria.gonzalez@techcorp.com',
      phone: '+34 600 123 456',
      company: 'TechCorp Solutions',
      position: 'CEO',
      stage: 'lead',
      value: 12000,
      source: 'web',
      priority: 'high',
      notes: 'Interesada en solución completa. Presupuesto aprobado.',
      createdAt: new Date('2025-06-20'),
      lastContact: new Date('2025-06-22')
    },
    {
      id: '002',
      name: 'Patricia Silva',
      email: 'patricia.silva@medicorp.com',
      phone: '+34 600 789 012',
      company: 'MediCorp Health',
      position: 'Director',
      stage: 'contacted',
      value: 22000,
      source: 'event',
      priority: 'high',
      notes: 'Llamada programada para mañana. Muy interesada.',
      createdAt: new Date('2025-06-18'),
      lastContact: new Date('2025-06-23')
    },
    {
      id: '003',
      name: 'Carmen Morales',
      email: 'carmen@innovatech.com',
      phone: '+34 600 345 678',
      company: 'InnovaTech Solutions',
      position: 'CEO',
      stage: 'client',
      value: 28000,
      source: 'referral',
      priority: 'high',
      notes: 'Cliente exitoso. Contrato firmado.',
      createdAt: new Date('2025-05-15'),
      lastContact: new Date('2025-06-15')
    }
  ],
  activities: [
    {
      id: '001',
      contactId: '001',
      type: 'call',
      title: 'Llamada inicial',
      description: 'Primera conversación sobre necesidades del proyecto',
      date: new Date('2025-06-22'),
      completed: true,
      duration: 25
    },
    {
      id: '002',
      contactId: '002',
      type: 'email',
      title: 'Propuesta técnica enviada',
      description: 'Incluye cronograma y presupuesto detallado',
      date: new Date('2025-06-23'),
      completed: true,
      opened: true
    }
  ]
};

/**
 * Guardar nuevo contacto
 */
window.saveContact = function() {
  const form = document.getElementById('contactForm');
  
  // Validar campos requeridos
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const newContact = {
    id: String(crmDatabase.contacts.length + 1).padStart(3, '0'),
    name: document.getElementById('contactName').value,
    email: document.getElementById('contactEmail').value,
    phone: document.getElementById('contactPhone').value,
    company: document.getElementById('contactCompany').value,
    position: document.getElementById('contactPosition').value,
    stage: document.getElementById('contactStage').value,
    value: parseFloat(document.getElementById('contactValue').value) || 0,
    source: document.getElementById('contactSource').value,
    priority: document.querySelector('input[name="contactPriority"]:checked').value,
    notes: document.getElementById('contactNotes').value,
    createdAt: new Date(),
    lastContact: new Date()
  };
  
  // Agregar a la base de datos
  crmDatabase.contacts.push(newContact);
  
  // Cerrar modal y limpiar formulario
  const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
  modal.hide();
  form.reset();
  
  // Resetear radio buttons
  document.getElementById('priorityMedium').checked = true;
  
  // Mostrar notificación
  showNotification(`Contacto ${newContact.name} creado exitosamente`, 'success');
  
  // Actualizar contadores del CRM
  updateCRMCounters();
  
  console.log('Nuevo contacto creado:', newContact);
};

/**
 * Guardar nueva actividad
 */
window.saveActivity = function() {
  const form = document.getElementById('activityForm');
  
  const newActivity = {
    id: String(crmDatabase.activities.length + 1).padStart(3, '0'),
    contactId: document.getElementById('activityContact').value,
    type: document.getElementById('activityType').value,
    title: document.getElementById('activityTitle').value,
    description: document.getElementById('activityDescription').value,
    date: new Date(document.getElementById('activityDate').value + 'T' + document.getElementById('activityTime').value),
    completed: false,
    reminder: document.getElementById('activityReminder').checked,
    createdAt: new Date()
  };
  
  // Agregar a la base de datos
  crmDatabase.activities.push(newActivity);
  
  // Cerrar modal y limpiar formulario
  const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'));
  modal.hide();
  form.reset();
  
  // Mostrar notificación
  showNotification(`Actividad "${newActivity.title}" programada exitosamente`, 'success');
  
  // Actualizar contadores
  updateCRMCounters();
  
  console.log('Nueva actividad creada:', newActivity);
};

/**
 * Actualizar contadores del CRM
 */
function updateCRMCounters() {
  const activeContacts = crmDatabase.contacts.filter(c => c.stage !== 'client').length;
  const totalContacts = crmDatabase.contacts.length;
  const totalActivities = crmDatabase.activities.length;
  
  // Actualizar badges en las tabs si existen
  const pipelineBadge = document.querySelector('#pipeline-tab .badge');
  if (pipelineBadge) {
    pipelineBadge.textContent = activeContacts;
  }
  
  const contactsBadge = document.querySelector('#contacts-tab .badge');
  if (contactsBadge) {
    contactsBadge.textContent = totalContacts;
  }
  
  const activitiesBadge = document.querySelector('#activities-tab .badge');
  if (activitiesBadge) {
    activitiesBadge.textContent = totalActivities;
  }
}

/**
 * Renderizar gráficos del CRM
 */
function renderCRMCharts() {
  // Gráfico de evolución del pipeline
  const pipelineCanvas = document.getElementById('pipelineEvolutionChart');
  if (pipelineCanvas) {
    const ctx = pipelineCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Leads',
            data: [5, 8, 12, 9, 15, 18],
            borderColor: '#6c757d',
            backgroundColor: 'rgba(108, 117, 125, 0.1)',
            tension: 0.4
          },
          {
            label: 'Contactados',
            data: [3, 5, 8, 6, 10, 12],
            borderColor: '#17a2b8',
            backgroundColor: 'rgba(23, 162, 184, 0.1)',
            tension: 0.4
          },
          {
            label: 'Propuestas',
            data: [2, 3, 5, 4, 7, 8],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.4
          },
          {
            label: 'Clientes',
            data: [1, 1, 2, 2, 3, 4],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Gráfico de fuentes de leads
  const leadSourceCanvas = document.getElementById('leadSourceChart');
  if (leadSourceCanvas) {
    const ctx = leadSourceCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Página Web', 'LinkedIn', 'Referidos', 'Eventos', 'Cold Email'],
        datasets: [{
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            '#3001ff',
            '#0077b5',
            '#28a745',
            '#ffc107',
            '#dc3545'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }
    });
  }
}

/**
 * Inicializar CRM cuando se muestra la vista
 */
function initializeCRM() {
  // Renderizar gráficos cuando se muestra la vista de reportes CRM
  const crmReportsTab = document.getElementById('crm-reports-tab');
  if (crmReportsTab) {
    crmReportsTab.addEventListener('shown.bs.tab', function () {
      setTimeout(() => {
        renderCRMCharts();
      }, 100);
    });
  }
  
  // Actualizar contadores iniciales
  updateCRMCounters();
  
  // Configurar drag & drop para el pipeline
  setupPipelineDragDrop();
}

/**
 * Configurar drag & drop para mover contactos entre etapas del pipeline
 */
function setupPipelineDragDrop() {
  const prospectCards = document.querySelectorAll('.prospect-card');
  const pipelineColumns = document.querySelectorAll('.pipeline-column .card-body');
  
  let draggedProspect = null;
  
  prospectCards.forEach(card => {
    card.setAttribute('draggable', 'true');
    
    card.addEventListener('dragstart', (e) => {
      draggedProspect = e.target.closest('.prospect-card');
      setTimeout(() => {
        if (draggedProspect) draggedProspect.style.opacity = '0.5';
      }, 0);
    });
    
    card.addEventListener('dragend', () => {
      if (draggedProspect) draggedProspect.style.opacity = '1';
      draggedProspect = null;
    });
  });
  
  pipelineColumns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      column.style.backgroundColor = '#f0f0ff';
    });
    
    column.addEventListener('dragleave', () => {
      column.style.backgroundColor = '';
    });
    
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.style.backgroundColor = '';
      
      if (draggedProspect) {
        column.appendChild(draggedProspect);
        
        // Determinar nueva etapa basada en la columna
        const columnHeader = column.previousElementSibling.textContent;
        let newStage = 'lead';
        
        if (columnHeader.includes('Contactados')) newStage = 'contacted';
        else if (columnHeader.includes('Propuesta')) newStage = 'proposal';
        else if (columnHeader.includes('Clientes')) newStage = 'client';
        
        // Actualizar en la base de datos (simulado)
        const prospectName = draggedProspect.querySelector('.prospect-name').textContent;
        console.log(`${prospectName} movido a etapa: ${newStage}`);
        
        showNotification(`Contacto movido a ${columnHeader}`, 'success');
      }
    });
  });
}

/**
 * Buscar contactos
 */
function searchContacts(query) {
  const results = crmDatabase.contacts.filter(contact => 
    contact.name.toLowerCase().includes(query.toLowerCase()) ||
    contact.company.toLowerCase().includes(query.toLowerCase()) ||
    contact.email.toLowerCase().includes(query.toLowerCase())
  );
  
  console.log('Resultados de búsqueda:', results);
  return results;
}

/**
 * Filtrar contactos por etapa
 */
function filterContactsByStage(stage) {
  if (stage === 'all') return crmDatabase.contacts;
  
  return crmDatabase.contacts.filter(contact => contact.stage === stage);
}

/**
 * Generar reporte CRM
 */
function generateCRMReport() {
  const report = {
    totalContacts: crmDatabase.contacts.length,
    leadCount: crmDatabase.contacts.filter(c => c.stage === 'lead').length,
    contactedCount: crmDatabase.contacts.filter(c => c.stage === 'contacted').length,
    proposalCount: crmDatabase.contacts.filter(c => c.stage === 'proposal').length,
    clientCount: crmDatabase.contacts.filter(c => c.stage === 'client').length,
    totalPipelineValue: crmDatabase.contacts.reduce((sum, contact) => sum + contact.value, 0),
    averageDealValue: crmDatabase.contacts.reduce((sum, contact) => sum + contact.value, 0) / crmDatabase.contacts.length,
    conversionRate: (crmDatabase.contacts.filter(c => c.stage === 'client').length / crmDatabase.contacts.length * 100).toFixed(1),
    activitiesCount: crmDatabase.activities.length
  };
  
  console.log('Reporte CRM generado:', report);
  return report;
}

// Función para exportar datos
window.exportCRMData = function(format) {
  const report = generateCRMReport();
  
  if (format === 'pdf') {
    showNotification('Exportando reporte en PDF...', 'info');
    // Aquí se integraría con una librería de PDF como jsPDF
  } else if (format === 'excel') {
    showNotification('Exportando reporte en Excel...', 'info');
    // Aquí se integraría con una librería como SheetJS
  }
  
  console.log('Exportando datos en formato:', format);
};

// Función para programar recordatorios
function scheduleReminder(activity) {
  if (activity.reminder && activity.date > new Date()) {
    const timeUntilReminder = activity.date.getTime() - new Date().getTime() - (30 * 60 * 1000); // 30 min antes
    
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        showNotification(`Recordatorio: ${activity.title} en 30 minutos`, 'warning');
      }, timeUntilReminder);
    }
  }
}

// Agregar estas líneas al final del DOMContentLoaded principal:

// Inicializar CRM cuando se carga la página
initializeCRM();

// Configurar eventos para el CRM
document.addEventListener('click', function(e) {
  // Manejar clics en botones del CRM
  if (e.target.closest('.prospect-actions .btn')) {
    const action = e.target.closest('.btn');
    const prospectCard = e.target.closest('.prospect-card');
    const prospectName = prospectCard?.querySelector('.prospect-name')?.textContent;
    
    if (action.querySelector('.bi-telephone')) {
      showNotification(`Iniciando llamada a ${prospectName}`, 'info');
    } else if (action.querySelector('.bi-envelope')) {
      showNotification(`Abriendo email para ${prospectName}`, 'info');
    } else if (action.querySelector('.bi-calendar-plus')) {
      showNotification(`Programando actividad para ${prospectName}`, 'info');
    }
  }
});

// Configurar fecha por defecto en el modal de actividades
const activityModal = document.getElementById('activityModal');
if (activityModal) {
  activityModal.addEventListener('show.bs.modal', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activityDate').value = today;
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('activityTime').value = timeString;
  });
}

// Funcionalidad para botones de chat
  document.querySelectorAll('.btn-action').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!this.disabled) {
        const memberName = this.closest('.team-member-card').querySelector('.member-name').textContent;
        console.log(`Iniciando chat con ${memberName}`);
        // Aquí podrías abrir un modal de chat o redirigir a la sección de comunicación
      }
    });
  });

  // Funcionalidad para hacer clic en un miembro
  document.querySelectorAll('.team-member-card').forEach(card => {
    card.addEventListener('click', function() {
      const memberName = this.querySelector('.member-name').textContent;
      const memberRole = this.querySelector('.member-role').textContent;
      console.log(`Ver perfil de ${memberName} - ${memberRole}`);
      // Aquí podrías mostrar más información del miembro
    });
  });

  // Actualizar estados en tiempo real (simulado)
  setInterval(updateTeamStatus, 30000); // Actualizar cada 30 segundos
});

function updateTeamStatus() {
  // Simular cambios de estado
  const members = document.querySelectorAll('.team-member-card');
  members.forEach(member => {
    const statusText = member.querySelector('.status-text');
    const statusIndicator = member.querySelector('.status-indicator');
    
    // Simular cambios ocasionales de estado
    if (Math.random() < 0.1) { // 10% de probabilidad de cambio
      const statuses = ['Disponible', 'Programando', 'En reunión', 'Diseñando'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      statusText.textContent = randomStatus;
    }
  });
}
