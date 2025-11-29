document.addEventListener("DOMContentLoaded", () => {
    /* =========================================
       1. SELECTORES Y VARIABLES BASE
       ========================================== */
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('#mobile-menu-toggle');
    const navMenu = document.querySelector('#nav-menu-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const sections = document.querySelectorAll('header, section');

    /* =========================================
       2. MENÚ MÓVIL
       ========================================== */
    const toggleMobileMenu = () => {
        if (!menuToggle || !navMenu) return;
        menuToggle.classList.toggle('is-active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    /* =========================================
       3. NAVBAR & SCROLL
       ========================================== */
    const headerScrollTrigger = () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', headerScrollTrigger);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navHeight = navbar ? navbar.offsetHeight : 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight - 8;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            }
        });
    });

    /* =========================================
       4. SCROLL SPY & ANIMACIONES
       ========================================== */
    const scrollSpy = () => {
        let currentSectionId = '';
        const scrollPosition = window.pageYOffset + 160; 
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', scrollSpy);

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    animatedElements.forEach(el => observer.observe(el));

    // Triggers iniciales
    headerScrollTrigger();
    scrollSpy();

    /* =========================================
       5. TABS (PAI)
       ========================================== */
    (function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        if (!tabButtons.length || !tabPanels.length) return;

        function activateTab(name, pushState = true) {
            tabButtons.forEach(btn => {
                const is = btn.dataset.tab === name;
                btn.classList.toggle('active', is);
                btn.setAttribute('aria-selected', is ? 'true' : 'false');
            });
            tabPanels.forEach(panel => {
                const is = panel.id === 'tab-' + name;
                panel.classList.toggle('active', is);
                panel.setAttribute('aria-hidden', is ? 'false' : 'true');
            });
            if (pushState) {
                try { history.replaceState(null, '', '#' + name); } catch (e) {}
            }
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                activateTab(btn.dataset.tab);
            });
        });

        const hash = location.hash.replace('#','');
        const valid = Array.from(tabButtons).map(b => b.dataset.tab);
        if (hash && valid.includes(hash)) activateTab(hash, false);
        else activateTab('resumen', false);
    })();

    /* =========================================
       6. MANEJO DE FORMULARIO DE CONTACTO
       ========================================== */
    const contactForm = document.getElementById("contact-form");
    const statusBox = document.getElementById("form-status");

    if (contactForm && statusBox) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Detenemos el envío estándar

            // Feedback visual inmediato
            statusBox.innerHTML = "⏳ Enviando mensaje...";
            statusBox.className = "status sending";
            statusBox.style.display = "block";

            const formData = new FormData(contactForm);

            fetch("https://formsubmit.co/ajax/olivergenao.alcalde@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            })
            .then(response => response.json())
            .then(data => {
                statusBox.innerHTML = "✔️ ¡Mensaje recibido! Gracias por contactarnos.";
                statusBox.className = "status success";
                contactForm.reset();
                
                // Ocultar mensaje después de 5 segundos
                setTimeout(() => { statusBox.style.display = "none"; }, 5000);
            })
            .catch(error => {
                console.error("Error:", error);
                statusBox.innerHTML = "❌ Hubo un error. Intenta enviarnos un correo directo.";
                statusBox.className = "status error";
            });
        });
    }

    /* =========================================
       7. MODAL CONTACTO (Mejor que alert)
       ========================================== */
    const floatingCTA = document.getElementById('floating-cta');
    const modalOverlay = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal');

    if (floatingCTA && modalOverlay) {
        // Abrir modal
        floatingCTA.addEventListener('click', function(e) {
            e.preventDefault();
            modalOverlay.classList.add('active');
        });

        // Cerrar modal
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });

        // Cerrar al hacer clic fuera
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });

        // Scroll Logic para mostrar botón
        const hero = document.querySelector('.hero-section');
        const showThreshold = 120;
        
        function handleCTAVisibility() {
            const heroBottom = hero ? (hero.getBoundingClientRect().bottom + window.pageYOffset) : 0;
            if (window.pageYOffset < Math.min(heroBottom, showThreshold)) {
                floatingCTA.style.opacity = '0';
                floatingCTA.style.pointerEvents = 'none';
            } else {
                floatingCTA.style.opacity = '1';
                floatingCTA.style.pointerEvents = 'auto';
            }
        }
        
        floatingCTA.style.opacity = '0';
        floatingCTA.style.pointerEvents = 'none';
        window.addEventListener('scroll', handleCTAVisibility, {passive:true});
        window.addEventListener('load', handleCTAVisibility);
    }
});

/* =========================================
   ACTIVADOR STAGGER (Animaciones)
   ========================================== */
(function(){
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        document.querySelectorAll('.stagger').forEach(el => staggerObserver.observe(el));
    } else {
        document.querySelectorAll('.stagger').forEach(el => el.classList.add('in-view'));
    }
})();

/* =========================================
   LÓGICA DEL ASISTENTE VIRTUAL IA
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const widget = document.getElementById('ai-widget-container');
    const toggleBtn = document.getElementById('ai-toggle-btn');
    const closeBtn = document.getElementById('ai-close-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    
    if(!widget) return; 

    toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('ai-widget-open');
        if (widget.classList.contains('ai-widget-open') && messagesContainer.children.length === 0) {
            setTimeout(() => addBotMessage("👋 Hola. Soy el Asistente del PAI. Tengo acceso al informe de investigación del proyecto.\n\nPuedes preguntarme por el objetivo, la finalidad, el autor o detalles técnicos."), 500);
        }
    });

    closeBtn.addEventListener('click', () => widget.classList.remove('ai-widget-open'));

    const knowledgeBase = [
        { 
            keywords: ['autor', 'creador', 'quien', 'alcalde', 'oliver', 'genao'], 
            response: "👤 **Autor del Proyecto:**\nEl PAI fue diseñado y desarrollado por **Oliver Genao**, Alcalde de San José, como una propuesta innovadora para el Foro de Alcaldes (MINUME XVI) alineada con la Agenda 2030." 
        },
        { 
            keywords: ['objetivo', 'central', 'meta', 'mision', 'propósito'], 
            response: "🎯 **Objetivo Central:**\nTransformar la infraestructura tecnológica pasiva de San José (tótems y parabuses) en capacidades ciudadanas activas, cerrando la brecha de apropiación entre el centro y la periferia." 
        },
        { 
            keywords: ['finalidad', 'para que', 'fin', 'impacto', 'futuro'], 
            response: "🚀 **Finalidad del Proyecto:**\nLograr una **Inclusión Digital Real**. No buscamos solo instalar tecnología, sino garantizar que adultos mayores, jóvenes y comunidades vulnerables la utilicen para mejorar su calidad de vida, seguridad y educación." 
        },
        { 
            keywords: ['problema', 'dualismo', 'brecha', 'diagnostico', 'error'], 
            response: "⚠️ **El Problema Detectado:**\nExiste un 'Dualismo Digital'. San José tiene hardware (115 tótems), pero los datos muestran que su uso es casi nulo en los barrios periféricos. Tenemos una ciudad conectada, pero ciudadanos desconectados." 
        },
        { 
            keywords: ['solucion', 'mac', 'software', 'app', 'modulo', 'herramienta'], 
            response: "💡 **La Solución (MAC):**\nEl Módulo de Apropiación Ciudadana (MAC) es un software de **código abierto** y marca blanca que incluye:\n1. Mapa de activos.\n2. Tutoriales de uso.\n3. Canal de reportes ciudadanos." 
        },
        { 
            keywords: ['ods', 'agenda 2030', 'onu', 'naciones unidas', 'sostenible'], 
            response: "🇺🇳 **Alineación ODS:**\nEste proyecto cumple con:\n- **ODS 9:** Innovación e infraestructura.\n- **ODS 11:** Ciudades sostenibles.\n- **ODS 17:** Alianzas (a través del mecanismo MIPD)." 
        },
        { 
            keywords: ['fases', 'tiempo', 'cronograma', 'etapas'], 
            response: "📅 **Hoja de Ruta (18 meses):**\n- Fase 1 (1-6 meses): Desarrollo MAC y Piloto.\n- Fase 2 (7-12 meses): Capacitación masiva.\n- Fase 3 (13-18 meses): Evaluación y Transferencia (MIPD)." 
        },
        { 
            keywords: ['hola', 'buenas', 'saludos', 'hi'], 
            response: "¡Hola! Estoy listo para responder preguntas sobre la investigación del PAI San José." 
        }
    ];

    window.processUserMessage = () => {
        const text = userInput.value.trim();
        if (!text) return;
        
        addMessage(text, 'user-msg');
        userInput.value = '';
        addTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const answer = findAnswer(text);
            addBotMessage(answer);
        }, 800);
    };

    window.sendQuery = (text) => {
        addMessage(text, 'user-msg');
        addTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            const answer = findAnswer(text);
            addBotMessage(answer);
        }, 800);
    };

    window.handleEnter = (e) => {
        if (e.key === 'Enter') processUserMessage();
    };

    function findAnswer(input) {
        const lowerInput = input.toLowerCase();
        for (let item of knowledgeBase) {
            if (item.keywords.some(k => lowerInput.includes(k))) {
                return item.response;
            }
        }
        return `❌ **No tengo esa información en mi base de datos.**\n\nPara consultas específicas, por favor contacta directamente al autor:\n\n📧 **Correo:** olivergenao.alcalde@gmail.com\n📱 **WhatsApp:** 826-692-6883`;
    }

    function addMessage(text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addBotMessage(text) {
        addMessage(text, 'bot-msg');
    }

    let typingDiv = null;
    function addTypingIndicator() {
        typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-msg typing';
        typingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    function removeTypingIndicator() {
        if(typingDiv) typingDiv.remove();
    }
});
