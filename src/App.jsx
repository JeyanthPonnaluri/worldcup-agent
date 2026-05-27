import React, { useState, useEffect, useRef } from "react";
import StadiumMap from "./StadiumMap";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import Profile from "./Profile";
import Feedback from "./Feedback";
import LandingPage from "./LandingPage";


// Translation Dictionary for Multilingual Support (EN, ES, PT)
const TRANSLATIONS = {
  en: {
    homeTitle: "KHELMITRA AI",
    heroSubtitle: "Match Day • Live",
    heroTitle: "Engineered for the",
    heroTitleItalic: "ultimate fan",
    ctaPlan: "Plan My Match Day",
    findFood: "Find Food",
    transitStatus: "Transit Status",
    routes: "Routes",
    tickets: "Tickets",
    upcomingMatches: "Upcoming Matches",
    archive: "Archive",
    setAlert: "Set Alert",
    crowdDynamics: "Crowd Dynamics",
    capacity: "Capacity",
    traffic: "Traffic",
    portalTitle: "Intelligence Portal v1.0",
    portalPrompt: "I can curate your perfect match-day itinerary, find optimized transit routes, or secure a reservation. How may I assist?",
    inquirePlaceholder: "Inquire here...",
    chatTab: "Chat",
    statsTab: "Stats",
    itineraryTab: "Itinerary",
    settingsTab: "Settings",
    homeTab: "Home",
    systemOnline: "System Online",
    agentTitle: "AI Smart Agent",
    agentSubtitle: "Tactical Match-Day Intelligence curated from active stadium Node",
    latency: "Latency",
    synthesizing: "Synthesizing intelligence...",
    navPath: "Navigation Path",
    launchAR: "Launch AR Hud",
    avoidingCrowds: "Avoiding crowds",
    vegFoodNearA: "Vegetarian food near Gate A",
    emergencyExits: "Emergency exits",
    wifiZones: "Wi-Fi zones",
    queryPlaceholder: "Query system...",
    opsCenter: "Stadium Operations Center",
    stadiumIntel: "Stadium Intelligence",
    heatmapLabel: "TECH_DATA: HEAT_MAP_V2",
    zonesBtn: "Zones",
    infraBtn: "Infra",
    occupancyLabel: "Occupancy",
    tempLabel: "Temp",
    refreshDataBtn: "Refresh Data",
    gateStatusHeader: "Gate Status",
    waitLabel: "Wait Time",
    agentAdvisory: "Agent Advisory",
    getRouteBtn: "Get Route",
    restrooms: "Restrooms",
    concessions: "Concessions",
    officialGear: "Official Gear",
    announcements: "Announcements",
    liveItinerary: "Live Itinerary",
    matchArchive: "Match Archive",
    journey: "The Journey",
    departure: "Departure",
    duration: "Duration",
    transport: "Transport",
    crowdDensity: "Crowd Density",
    gate: "Gate",
    estWait: "Est. Wait",
    dietaryMatch: "Dietary Match",
    preOrderNow: "Pre-Order Now",
    curatorRecommendation: "Curator Recommendation",
    profileTitle: "Fan Profile",
    refLabel: "Ref",
    changeAvatar: "CHANGE AVATAR",
    usernameLabel: "Username",
    globalRanking: "Global Ranking",
    interfaceLanguage: "Interface Language",
    smartAlerts: "Smart Alerts",
    matchStartAlerts: "Match Start Alerts",
    liveScoreUpdates: "Live Score Updates",
    crowdCalibration: "Crowd Calibration",
    dietaryRequirements: "Dietary Requirements",
    dataGovernance: "Data Governance",
    resetPersonalArchive: "Reset Personal Archive",
    deactivateGlobalId: "Deactivate Global ID"
  },
  es: {
    homeTitle: "KHELMITRA AI",
    heroSubtitle: "Día de Partido • En Vivo",
    heroTitle: "Diseñado para el",
    heroTitleItalic: "fanático supremo",
    ctaPlan: "Planear Mi Día de Partido",
    findFood: "Buscar Comida",
    transitStatus: "Tránsito",
    routes: "Rutas",
    tickets: "Boletos",
    upcomingMatches: "Próximos Partidos",
    archive: "Archivo",
    setAlert: "Alerta",
    crowdDynamics: "Flujo de Multitud",
    capacity: "Capacidad",
    traffic: "Tráfico",
    portalTitle: "Portal de Inteligencia v1.0",
    portalPrompt: "Puedo organizar tu itinerario ideal, encontrar rutas de tránsito optimizadas o hacer reservaciones. ¿Cómo te ayudo?",
    inquirePlaceholder: "Preguntar aquí...",
    chatTab: "Agente",
    statsTab: "Stats",
    itineraryTab: "Itinerario",
    settingsTab: "Ajustes",
    homeTab: "Inicio",
    systemOnline: "Sistema Activo",
    agentTitle: "Agente Inteligente AI",
    agentSubtitle: "Inteligencia táctica de día de partido obtenida del nodo del estadio",
    latency: "Latencia",
    synthesizing: "Sintetizando información...",
    navPath: "Ruta de Navegación",
    launchAR: "Iniciar HUD de AR",
    avoidingCrowds: "Evitar multitudes",
    vegFoodNearA: "Comida vegetariana cerca de Puerta A",
    emergencyExits: "Salidas de emergencia",
    wifiZones: "Zonas de Wi-Fi",
    queryPlaceholder: "Consultar sistema...",
    opsCenter: "Operaciones del Estadio",
    stadiumIntel: "Inteligencia de Estadio",
    heatmapLabel: "DATOS_TECH: MAPA_CALOR_V2",
    zonesBtn: "Zonas",
    infraBtn: "Infra",
    occupancyLabel: "Ocupación",
    tempLabel: "Temp",
    refreshDataBtn: "Actualizar",
    gateStatusHeader: "Estado de Puertas",
    waitLabel: "Tiempo de espera",
    agentAdvisory: "Asesoría del Agente",
    getRouteBtn: "Obtener Ruta",
    restrooms: "Baños",
    concessions: "Alimentos",
    officialGear: "Tienda Oficial",
    announcements: "Anuncios",
    liveItinerary: "Itinerario En Vivo",
    matchArchive: "Historial de Partidos",
    journey: "El Viaje",
    departure: "Salida",
    duration: "Duración",
    transport: "Transporte",
    crowdDensity: "Densidad de Multitud",
    gate: "Puerta",
    estWait: "Espera Estimada",
    dietaryMatch: "Coincidencia de Dieta",
    preOrderNow: "Pre-ordenar",
    curatorRecommendation: "Recomendación del Agente",
    profileTitle: "Perfil de Fan",
    refLabel: "Ref",
    changeAvatar: "CAMBIAR AVATAR",
    usernameLabel: "Usuario",
    globalRanking: "Ranking Global",
    interfaceLanguage: "Idioma de Interfaz",
    smartAlerts: "Alertas Inteligentes",
    matchStartAlerts: "Alerta Inicio Partido",
    liveScoreUpdates: "Resultados En Vivo",
    crowdCalibration: "Calibración de Multitud",
    dietaryRequirements: "Requisitos Alimentarios",
    dataGovernance: "Gobernanza de Datos",
    resetPersonalArchive: "Restablecer Archivo",
    deactivateGlobalId: "Desactivar ID Global"
  },
  pt: {
    homeTitle: "KHELMITRA AI",
    heroSubtitle: "Dia do Jogo • Ao Vivo",
    heroTitle: "Projetado para o",
    heroTitleItalic: "torcedor supremo",
    ctaPlan: "Planejar Dia do Jogo",
    findFood: "Buscar Comida",
    transitStatus: "Trânsito",
    routes: "Rotas",
    tickets: "Ingressos",
    upcomingMatches: "Próximos Jogos",
    archive: "Arquivo",
    setAlert: "Definir Alerta",
    crowdDynamics: "Fluxo de Público",
    capacity: "Capacidade",
    traffic: "Tráfego",
    portalTitle: "Portal de Inteligência v1.0",
    portalPrompt: "Posso criar o seu itinerário de jogo perfeito, achar rotas de transporte ou fazer reservas. Como posso ajudar?",
    inquirePlaceholder: "Pergunte aqui...",
    chatTab: "Agente",
    statsTab: "Painel",
    itineraryTab: "Itinerário",
    settingsTab: "Ajustes",
    homeTab: "Início",
    systemOnline: "Sistema Online",
    agentTitle: "Agente Inteligente AI",
    agentSubtitle: "Inteligência tática coletada do nó ativo do estádio",
    latency: "Latência",
    synthesizing: "Sintetizando inteligência...",
    navPath: "Caminho de Navegação",
    launchAR: "Iniciar AR Hud",
    avoidingCrowds: "Evitar multidões",
    vegFoodNearA: "Comida vegetariana perto do Portão A",
    emergencyExits: "Saídas de segurança",
    wifiZones: "Zonas de Wi-Fi",
    queryPlaceholder: "Consultar sistema...",
    opsCenter: "Operações do Estádio",
    stadiumIntel: "Inteligência de Estádio",
    heatmapLabel: "DADOS_TECH: MAPA_CALOR_V2",
    zonesBtn: "Zonas",
    infraBtn: "Infra",
    occupancyLabel: "Ocupação",
    tempLabel: "Temp",
    refreshDataBtn: "Atualizar Dados",
    gateStatusHeader: "Status dos Portões",
    waitLabel: "Tempo de Espera",
    agentAdvisory: "Recomendação do Agente",
    getRouteBtn: "Ver Rota",
    restrooms: "Banheiros",
    concessions: "Alimentação",
    officialGear: "Loja Oficial",
    announcements: "Anúncios",
    liveItinerary: "Itinerário Ao Vivo",
    matchArchive: "Histórico de Jogos",
    journey: "A Jornada",
    departure: "Partida",
    duration: "Duração",
    transport: "Transporte",
    crowdDensity: "Densidade de Público",
    gate: "Portão",
    estWait: "Espera Estimada",
    dietaryMatch: "Compatível com Dieta",
    preOrderNow: "Pedir Agora",
    curatorRecommendation: "Recomendação do Curador",
    profileTitle: "Perfil do Torcedor",
    refLabel: "Ref",
    changeAvatar: "ALTERAR AVATAR",
    usernameLabel: "Nome de Usuário",
    globalRanking: "Ranking Global",
    interfaceLanguage: "Idioma da Interface",
    smartAlerts: "Alertas Inteligentes",
    matchStartAlerts: "Início da Partida",
    liveScoreUpdates: "Gols Ao Vivo",
    crowdCalibration: "Calibração de Público",
    dietaryRequirements: "Requisitos Alimentares",
    dataGovernance: "Governança de Dados",
    resetPersonalArchive: "Apagar Histórico",
    deactivateGlobalId: "Desativar ID Global"
  }
};

const MOCK_STADIUMS = {
  "Narendra Modi Stadium Ahmedabad": {
    city: "Ahmedabad, GJ",
    gates: ["Gate A", "Gate B", "VIP Gate"],
    default_concessions: [
      { name: "Gujarati Dhokla House", tags: ["vegan", "gluten-free", "vegetarian"], menu: "Dhokla, Fafda, Jalebi, Chaas" }
    ]
  },
  "Wankhede Stadium Mumbai": {
    city: "Mumbai, MH",
    gates: ["Gate A", "Gate B", "VIP Gate"],
    default_concessions: [
      { name: "Mumbai Chowpatty Express", tags: ["vegetarian"], menu: "Vada Pav, Pav Bhaji, Bhel Puri" }
    ]
  },
  "M Chinnaswamy Stadium Bengaluru": {
    city: "Bengaluru, KA",
    gates: ["Gate A", "Gate B", "VIP Gate"],
    default_concessions: [
      { name: "Bangalore Tiffin Room", tags: ["vegan", "gluten-free", "vegetarian"], menu: "Idli, Filter Coffee, Masala Dosa" }
    ]
  },
  "Rajiv Gandhi International Stadium Hyderabad": {
    city: "Hyderabad, TG",
    gates: ["Gate A", "Gate B", "VIP Gate"],
    default_concessions: [
      { name: "Deccan Biryani Hub", tags: ["halal", "gluten-free", "vegetarian"], menu: "Hyderabadi Veg Biryani, Plain Dosa, Mirchi Bajji" }
    ]
  },
  "Arun Jaitley Stadium Delhi": {
    city: "Delhi, DL",
    gates: ["Gate A", "Gate B", "VIP Gate"],
    default_concessions: [
      { name: "Delhi Chaat Corner", tags: ["vegetarian"], menu: "Chole Bhature, Aloo Tikki Chaat" }
    ]
  }
};

const GATE_HOTSPOTS = {
  "Narendra Modi Stadium Ahmedabad": {
    "Gate A": { x: "28%", y: "45%" },
    "Gate B": { x: "72%", y: "55%" },
    "VIP Gate": { x: "50%", y: "20%" }
  },
  "Wankhede Stadium Mumbai": {
    "Gate A": { x: "28%", y: "45%" },
    "Gate B": { x: "72%", y: "55%" },
    "VIP Gate": { x: "50%", y: "20%" }
  },
  "M Chinnaswamy Stadium Bengaluru": {
    "Gate A": { x: "28%", y: "45%" },
    "Gate B": { x: "72%", y: "55%" },
    "VIP Gate": { x: "50%", y: "20%" }
  },
  "Rajiv Gandhi International Stadium Hyderabad": {
    "Gate A": { x: "28%", y: "45%" },
    "Gate B": { x: "72%", y: "55%" },
    "VIP Gate": { x: "50%", y: "20%" }
  },
  "Arun Jaitley Stadium Delhi": {
    "Gate A": { x: "28%", y: "45%" },
    "Gate B": { x: "72%", y: "55%" },
    "VIP Gate": { x: "50%", y: "20%" }
  }
};

const getGateColor = (gateName) => {
  if (gateName.includes("A")) return "#3b82f6"; // Blue
  if (gateName.includes("B")) return "#a855f7"; // Purple
  if (gateName.toLowerCase().includes("vip")) return "#f97316"; // Orange
  return "#06b6d4"; // Cyan
};

const STADIUM_COORDS = {
  "Narendra Modi Stadium Ahmedabad": { lat: 23.0919, lon: 72.5975 },
  "Wankhede Stadium Mumbai": { lat: 18.9389, lon: 72.8258 },
  "M Chinnaswamy Stadium Bengaluru": { lat: 12.9786, lon: 77.5987 },
  "Rajiv Gandhi International Stadium Hyderabad": { lat: 17.4065, lon: 78.5505 },
  "Arun Jaitley Stadium Delhi": { lat: 28.6379, lon: 77.2432 }
};

const MENU_PRICES = {
  "Dhokla": 80, "Fafda": 90, "Jalebi": 70, "Chaas": 30,
  "Vada Pav": 50, "Pav Bhaji": 120, "Bhel Puri": 65,
  "Idli": 60, "Filter Coffee": 40, "Masala Dosa": 90,
  "Hyderabadi Veg Biryani": 180, "Plain Dosa": 70, "Mirchi Bajji": 50,
  "Chole Bhature": 110, "Aloo Tikki Chaat": 75,
  "Pretzels": 80, "Soda": 50, "Hot Dogs": 100, "Coke": 50, "Water Bottle": 30, "Popcorn": 90
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const [showARHUD, setShowARHUD] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [preOrderQuantities, setPreOrderQuantities] = useState({});
  const [preOrderStep, setPreOrderStep] = useState("cart");
  const [heatmapView, setHeatmapView] = useState("zones");
  const [activeTab, setActiveTab] = useState("landing");
  const [itinerarySubTab, setItinerarySubTab] = useState("active");
  const [stadium, setStadium] = useState("Wankhede Stadium Mumbai");
  const [crowdSliderVal, setCrowdSliderVal] = useState(50);
  const [diet, setDiet] = useState(["vegetarian"]);
  const [username, setUsername] = useState("Alex_Martinez_26");
  const [user, setUser] = useState(null);

  // Sync preferences (diet, crowd tolerance) dynamically to backend if logged in
  const syncPreferencesToBackend = async (newDiet, newCrowdToleranceVal) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const crowdToleranceStr = newCrowdToleranceVal <= 25 ? "low" : newCrowdToleranceVal <= 60 ? "medium" : "high";
    try {
      await fetch("/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          dietary_preferences: newDiet,
          crowd_tolerance: crowdToleranceStr,
          favorite_team: user?.favorite_team || "",
          preferred_gate: user?.preferred_gate || ""
        })
      });
    } catch (err) {
      console.error("Failed to sync preferences to backend:", err);
    }
  };

  // Check persistent session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/auth/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Token expired or invalid");
      })
      .then(userData => {
        setUser(userData);
        setUsername(userData.username);
        if (userData.dietary_preferences) {
          setDiet(userData.dietary_preferences);
        }
        if (userData.crowd_tolerance) {
          const val = userData.crowd_tolerance === "low" ? 20 : userData.crowd_tolerance === "medium" ? 50 : 80;
          setCrowdSliderVal(val);
        }
        setActiveTab("home");
      })
      .catch(err => {
        console.warn(err);
        localStorage.removeItem("token");
        setUser(null);
        setActiveTab("landing");
      });
    } else {
      setActiveTab("landing");
    }
  }, []);

  
  // Toggles for notifications
  const [matchAlertsActive, setMatchAlertsActive] = useState(true);
  const [liveScoresActive, setLiveScoresActive] = useState(true);

  // Simulated live gate times (bridge between settings / simulator and dashboard)
  const [gateTimes, setGateTimes] = useState({
    "Gate A": 42,
    "Gate B": 18,
    "VIP Gate": 3
  });

  // Trend data state for the crowd trend graph
  const [trendData, setTrendData] = useState({});

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "agent",
      text: "Namaste! Welcome to KhelMitra AI. I am monitoring live feeds for today's matches. Need tactical transit routes or local food suggestions?",
      timestamp: "12:00 PM"
    }
  ]);
  const [inputText, setInputText] = useState("");
  
  // Streaming Reasoning State
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningLogs, setReasoningLogs] = useState([]);
  const chatEndRef = useRef(null);

  // Dynamic Calculated Itinerary
  const [itinerary, setItinerary] = useState(null);

  // History State
  const [historyItems] = useState([
    { id: "IPL-9018", match: "Mumbai Indians vs Chennai Super Kings", date: "May 12, 2026", venue: "Wankhede Stadium Mumbai", type: "Completed Itinerary", amount: "MI won by 5 wkts" },
    { id: "CWC-4402", match: "India vs Pakistan", date: "May 15, 2026", venue: "Narendra Modi Stadium Ahmedabad", type: "Archived Itinerary", amount: "IND won by 7 runs" }
  ]);

  const [activeAlerts, setActiveAlerts] = useState({});

  // Auto Scroll Chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isReasoning, reasoningLogs]);

  // Derive crowd tolerance string for itinerary cushion logic
  const crowdTolerance = crowdSliderVal <= 25 ? "low" : crowdSliderVal <= 60 ? "medium" : "high";

  // Re-build itinerary on dependent state changes
  useEffect(() => {
    buildItinerary();
  }, [stadium, crowdSliderVal, diet, gateTimes]);

  // Connect to WebSocket for real-time reactive crowd telemetry updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/crowd?stadium=${encodeURIComponent(stadium)}`;
    
    console.log("Connecting to crowd telemetry WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if ((message.type === "initial_data" || message.type === "crowd_update") && message.data) {
          console.log("Received crowd telemetry via WebSocket:", message);
          setGateTimes(prev => ({
            ...prev,
            ...message.data
          }));
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed for stadium:", stadium);
    };

    return () => {
      ws.close();
    };
  }, [stadium]);

  // Fetch gate crowd trends from backend on active stadium change & poll every 5s
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const response = await fetch(`/api/crowd/trend/${encodeURIComponent(stadium)}`);
        if (response.ok) {
          const data = await response.json();
          setTrendData(data);
        }
      } catch (err) {
        console.error("Failed to fetch crowd trend data:", err);
      }
    };

    fetchTrendData();
    const interval = setInterval(fetchTrendData, 5000);
    return () => clearInterval(interval);
  }, [stadium, gateTimes]);


  const t = TRANSLATIONS[language];

  const buildItinerary = () => {
    const city = MOCK_STADIUMS[stadium]?.city || "Local Arena";
    const gates = MOCK_STADIUMS[stadium]?.gates || ["Gate A"];
    
    // Recommended Gate is the one with the minimum wait time
    const sortedGates = [...gates].sort((a, b) => (gateTimes[a] || 0) - (gateTimes[b] || 0));
    const recommendedGate = sortedGates[0];
    const waitTime = gateTimes[recommendedGate] || 0;
    
    // Transit calculations based on stadium
    let travelTime = 30;
    let routeSummary = "Use regional transit corridor instructions.";
    if (stadium === "Narendra Modi Stadium Ahmedabad") {
      travelTime = 45;
      routeSummary = "Take Ahmedabad Metro to Sabarmati Station, walk 500m to the entry gates.";
    } else if (stadium === "Wankhede Stadium Mumbai") {
      travelTime = 30;
      routeSummary = "Take Western Railway local train to Churchgate Station, walk 200m to the stadium entrance.";
    } else if (stadium === "M Chinnaswamy Stadium Bengaluru") {
      travelTime = 25;
      routeSummary = "Board Namma Metro to Cubbon Park Station, exit directly opposite the stadium gates.";
    } else if (stadium === "Rajiv Gandhi International Stadium Hyderabad") {
      travelTime = 40;
      routeSummary = "Take Hyderabad Metro to Stadium Station (Blue Line) and follow the skywalk.";
    } else if (stadium === "Arun Jaitley Stadium Delhi") {
      travelTime = 35;
      routeSummary = "Take Delhi Metro to Delhi Gate Station (Violet Line), exit near Gate 2.";
    }

    // Food filtering matching selected diets
    const concessions = MOCK_STADIUMS[stadium]?.default_concessions || [];
    const matchedConcessions = concessions.filter(stall => 
      stall.tags.some(tag => diet.includes(tag))
    );

    const departureOffsetMinutes = crowdTolerance === "low" ? 150 : crowdTolerance === "medium" ? 90 : 60;
    
    setItinerary({
      stadium_name: stadium,
      city: city,
      match_time: "19:00",
      gate: recommendedGate,
      wait_time: waitTime,
      travel_route: routeSummary,
      travel_time_minutes: travelTime,
      food_stands: matchedConcessions.length > 0 ? matchedConcessions : [concessions[0] || { name: "Main Concourse Refreshments", menu: "Pretzels, Soda, Hot Dogs", tags: ["standard"] }],
      cushion_time: departureOffsetMinutes
    });
  };

  const handleOpenPreOrder = () => {
    const foodStand = itinerary?.food_stands?.[0];
    if (!foodStand) return;
    const items = foodStand.menu.split(", ");
    const initialQuantities = {};
    items.forEach(item => {
      initialQuantities[item] = 0;
    });
    setPreOrderQuantities(initialQuantities);
    setPreOrderStep("cart");
    setShowPreOrderModal(true);
  };

  const triggerAgentReasoning = (userPrompt, callback) => {
    setIsReasoning(true);
    setReasoningLogs([]);
    
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Call python FastAPI backend with active parameters
    fetch("/api/itinerary", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        prompt: userPrompt,
        stadium: stadium,
        crowd_tolerance: crowdTolerance,
        dietary_preferences: diet
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Agent backend API error");
      return res.json();
    })
    .then(data => {
      let currentLogIndex = 0;
      const interval = setInterval(() => {
        if (currentLogIndex < data.logs.length) {
          setReasoningLogs(prev => [...prev, data.logs[currentLogIndex]]);
          currentLogIndex++;
        } else {
          clearInterval(interval);
          setIsReasoning(false);
          if (callback) callback(data.itinerary);
        }
      }, 450);
    })
    .catch(err => {
      console.error("Error communicating with AI Agent:", err);
      // Fallback
      const logs = [
        `[ENTITY EXTRACTOR] Analyzing query: "${userPrompt}"`,
        `[DATABASE] MongoDB offline. Fetching mock sensors...`,
        `[SYNTHESIZER] Formatting response data.`
      ];
      let currentLogIndex = 0;
      const interval = setInterval(() => {
        if (currentLogIndex < logs.length) {
          setReasoningLogs(prev => [...prev, logs[currentLogIndex]]);
          currentLogIndex++;
        } else {
          clearInterval(interval);
          setIsReasoning(false);
          const fallbackText = `Here is a custom fallback itinerary. Based on your settings for **${stadium}**, I recommend routing through **${itinerary.gate}** (${itinerary.wait_time}m wait).`;
          if (callback) callback(fallbackText);
        }
      }, 450);
    });
  };

  const handleToggleQueue = (gate, currentWait) => {
    const nextWait = currentWait > 10 ? 3 : currentWait === 3 ? 12 : 35;
    // Optimistic UI update
    setGateTimes(prev => ({ ...prev, [gate]: nextWait }));

    // Post queue update to MongoDB
    fetch("/api/crowd/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stadium_name: stadium,
        gate_name: gate,
        waiting_time: nextWait
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to write to MongoDB");
      return res.json();
    })
    .then(data => {
      console.log("Telemetry successfully saved to MongoDB:", data);
    })
    .catch(err => {
      console.error("Error writing telemetry to MongoDB:", err);
    });
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText("");

    triggerAgentReasoning(prompt, (agentItinerary) => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "agent",
        text: agentItinerary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });
  };

  const handlePromptFromHome = () => {
    if (!inputText.trim()) return;
    setActiveTab("chat");
    handleSendMessage();
  };

  const selectQuickChip = (chipText) => {
    setInputText(chipText);
  };

  const handleToggleAlert = (matchId) => {
    setActiveAlerts(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (selectedLang === "es") {
      setLanguage("es");
    } else if (selectedLang === "pt") {
      setLanguage("pt");
    } else {
      setLanguage("en");
    }
  };

  const getCrowdLabel = (val) => {
    if (val < 25) return "SOLITARY";
    if (val < 50) return "QUIET";
    if (val < 75) return "OPTIMAL";
    if (val < 100) return "VIBRANT";
    return "MAX SOCIAL";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-28 box-border w-full">
      
      {/* -------------------- HEADER (Responsive centered) -------------------- */}
      {activeTab !== "landing" && (
        <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant py-4 px-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">sports_soccer</span>
              <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface uppercase">{t.homeTitle}</h1>
            </div>
            
            {/* Desktop Nav Integration */}
            <nav className="hidden md:flex gap-8 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {user ? (
                <>
                  <button id="nav-home" onClick={() => setActiveTab("home")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'home' ? 'text-primary' : ''}`}>{t.homeTab}</button>
                  <button id="nav-chat" onClick={() => setActiveTab("chat")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'chat' ? 'text-primary' : ''}`}>{t.chatTab}</button>
                  <button id="nav-stats" onClick={() => setActiveTab("stats")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'stats' ? 'text-primary' : ''}`}>{t.statsTab}</button>
                  <button id="nav-itinerary" onClick={() => setActiveTab("itinerary")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'itinerary' ? 'text-primary' : ''}`}>{t.itineraryTab}</button>
                  <button id="nav-profile" onClick={() => setActiveTab("profile")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'profile' ? 'text-primary' : ''}`}>Profile</button>
                  <button id="nav-logout" onClick={() => {
                    localStorage.removeItem("token");
                    setUser(null);
                    setUsername("Alex_Martinez_26");
                    setDiet(["vegetarian"]);
                    setCrowdSliderVal(50);
                    setActiveTab("landing");
                  }} className="transition-colors cursor-pointer hover:text-primary text-error">Logout</button>
                </>
              ) : (
                <>
                  <button id="nav-landing" onClick={() => setActiveTab("landing")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'landing' ? 'text-primary' : ''}`}>Home</button>
                  <button id="nav-login" onClick={() => setActiveTab("signin")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'signin' ? 'text-primary' : ''}`}>Login</button>
                  <button id="nav-signup" onClick={() => setActiveTab("signup")} className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'signup' ? 'text-primary' : ''}`}>Signup</button>
                </>
              )}
            </nav>

            <div 
              onClick={() => setActiveTab(user ? "profile" : "signin")} 
              className="w-9 h-9 rounded-full border border-outline-variant overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-surface cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz6ZjKAjot5xcKWh2OjqeJnd9uJaqCExiaklVcshv9uPPtAezNaARwE7RHby-MoQJy7EWP7ZI_PY04FoaoKDlcb0A1BPFLkBkL0F2UY9UZNUruJ4MKZOZNhmhyATx-BvQuZv57-FdM8ppYuC5miUoYrGYyQZPoSJc0jnDw16bZ-BEqCrslKeLetJcjNGBKPq49FaHLwKUX5GqThm5XuN6Wy6NI4m_NgTZe4-S8mMy0QU5ZaZ4XFVsErxzLynvi5pJCgNqqol9-F8Q"
              />
            </div>
          </div>
        </header>
      )}

      {/* -------------------- HOME SCREEN (Responsive centered card style) -------------------- */}
      {user && activeTab === "home" && (
        <div className="page-enter flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-12">
          {/* Hero section */}
          <section className="relative w-full h-[360px] flex items-center overflow-hidden bg-surface-container-highest rounded-lg border border-outline-variant">
            <img 
              alt="Stadium Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBawsQm2A8uKVPTTkGrrWo27DDMLeTSZwZS_s_ouH-tSAdGdID5CJtZeiJfUDkN0-tG2-OvcU_zvrFCvMO0WioLWAQ_imb03X-uMSpcdSriP9L2ltQiaNkIj2v_a56cBqCxdC0MROOF_1Mc6KLg65LwZ7aEOf2GynEZiSREFtrNwBpofK40lrV9q7CbwqtfHrSC1KXvqQNOoNa9CO4uiqEAC8MSvv2dY8C_D6h4vTK_Gv1T-1bYcNidQa_08ok-7Xk9ZAsRSUG0aCk"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="relative z-10 p-8 max-w-xl">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary live-dot"></span>
                <span className="font-label text-[10px] font-bold tracking-widest text-primary uppercase">{t.heroSubtitle}</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-on-surface leading-[1.1] mb-6">
                {t.heroTitle} <br/><span className="italic text-primary font-normal">{t.heroTitleItalic}</span>
              </h2>
              <button 
                onClick={() => { setActiveTab("itinerary"); setItinerarySubTab("active"); }} 
                className="bg-primary text-on-primary py-3.5 px-6 font-label text-xs font-bold uppercase tracking-widest editorial-shadow transition-all hover:bg-opacity-90 active:scale-95 flex items-center gap-3 cursor-pointer rounded-sm"
              >
                {t.ctaPlan}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="px-4 sm:px-12 -mt-10 relative z-20">
            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => { setActiveTab("itinerary"); setItinerarySubTab("active"); }} 
                className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col items-center gap-2.5 rounded-sm editorial-shadow hover:bg-surface-container-low transition-all cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
                <span className="font-label text-[10px] font-bold tracking-wider uppercase">{t.findFood}</span>
              </div>
              <div 
                onClick={() => { setActiveTab("itinerary"); setItinerarySubTab("active"); }} 
                className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col items-center gap-2.5 rounded-sm editorial-shadow hover:bg-surface-container-low transition-all cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-primary text-2xl">directions_bus</span>
                <span className="font-label text-[10px] font-bold tracking-wider uppercase">{t.routes}</span>
              </div>
              <div 
                onClick={() => { setActiveTab("itinerary"); setItinerarySubTab("active"); }} 
                className="bg-surface-container-lowest border border-outline-variant p-6 flex flex-col items-center gap-2.5 rounded-sm editorial-shadow hover:bg-surface-container-low transition-all cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                <span className="font-label text-[10px] font-bold tracking-wider uppercase">{t.tickets}</span>
              </div>
            </div>
          </section>

          {/* Upcoming Matches */}
          <section className="mt-12 w-full">
            <div className="flex justify-between items-baseline mb-6">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{t.upcomingMatches}</h3>
              <span onClick={() => { setActiveTab("itinerary"); setItinerarySubTab("history"); }} className="font-label text-xs font-bold text-primary cursor-pointer hover:underline tracking-widest uppercase">{t.archive}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Match Card 1 */}
              <div className="border border-outline-variant p-6 bg-surface-container-lowest editorial-shadow flex flex-col gap-5 rounded-sm">
                <div className="flex justify-between font-label text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase">
                  <span>May 28 • 19:30</span>
                  <span>Wankhede Stadium Mumbai</span>
                </div>
                <div className="flex items-center justify-between px-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold font-label bg-blue-600 text-white border border-outline-variant">MI</div>
                    <span className="font-headline text-base font-bold">MI</span>
                  </div>
                  <span className="font-display text-xl italic text-outline">vs</span>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold font-label bg-yellow-400 text-black border border-outline-variant">CSK</div>
                    <span className="font-headline text-base font-bold">CSK</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAlert("m1")}
                  className={`border py-3 font-label text-[10px] font-bold tracking-widest uppercase transition-colors rounded-sm cursor-pointer ${activeAlerts["m1"] ? 'bg-primary border-primary text-on-primary' : 'border-primary text-primary hover:bg-primary hover:text-on-primary'}`}
                >
                  {activeAlerts["m1"] ? 'Alert Active' : t.setAlert}
                </button>
              </div>
              {/* Match Card 2 */}
              <div className="border border-outline-variant p-6 bg-surface-container-lowest editorial-shadow flex flex-col gap-5 rounded-sm">
                <div className="flex justify-between font-label text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase">
                  <span>May 30 • 19:30</span>
                  <span>Narendra Modi Stadium Ahmedabad</span>
                </div>
                <div className="flex items-center justify-between px-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold font-label bg-red-600 text-white border border-outline-variant">RCB</div>
                    <span className="font-headline text-base font-bold">RCB</span>
                  </div>
                  <span className="font-display text-xl italic text-outline">vs</span>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold font-label bg-purple-700 text-yellow-300 border border-outline-variant">KKR</div>
                    <span className="font-headline text-base font-bold">KKR</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAlert("m2")}
                  className={`border py-3 font-label text-[10px] font-bold tracking-widest uppercase transition-colors rounded-sm cursor-pointer ${activeAlerts["m2"] ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {activeAlerts["m2"] ? 'Alert Active' : t.setAlert}
                </button>
              </div>
            </div>
          </section>

          {/* Live Crowd Status */}
          <section className="mt-12 w-full">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-6">{t.crowdDynamics}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div onClick={() => setActiveTab("stats")} className="bg-surface-container-lowest border border-outline-variant p-5 flex items-center justify-between hover:border-primary transition-all cursor-pointer rounded-sm editorial-shadow">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-surface-container border border-outline-variant flex items-center justify-center relative rounded-sm">
                    <span className="material-symbols-outlined text-primary text-3xl">stadium</span>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full live-dot"></div>
                  </div>
                  <div>
                    <p className="font-headline text-base font-bold">{stadium}</p>
                    <p className="font-label text-[10px] font-medium text-on-surface-variant tracking-wider uppercase">Active Arena • {itinerary?.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline text-xl font-bold text-primary">87%</p>
                  <p className="font-label text-[9px] font-bold tracking-widest uppercase opacity-60">{t.capacity}</p>
                </div>
              </div>
              <div onClick={() => setActiveTab("stats")} className="bg-surface-container-lowest border border-outline-variant p-5 flex items-center justify-between hover:border-primary transition-all cursor-pointer rounded-sm editorial-shadow">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-surface-container border border-outline-variant flex items-center justify-center rounded-sm">
                    <span className="material-symbols-outlined text-secondary text-3xl">directions_walk</span>
                  </div>
                  <div>
                    <p className="font-headline text-base font-bold">Transit Hub</p>
                    <p className="font-label text-[10px] font-medium text-on-surface-variant tracking-wider uppercase">Primary Station Node</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline text-xl font-bold text-secondary">Optimal</p>
                  <p className="font-label text-[9px] font-bold tracking-widest uppercase opacity-60">{t.traffic}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Smart Agent Prompt */}
          <section className="mt-12 w-full mb-12">
            <div className="bg-white border-l-4 border-primary p-8 editorial-shadow relative overflow-hidden rounded-sm">
              <div className="absolute -top-4 -right-4 p-4 opacity-5">
                <span className="material-symbols-outlined text-9xl text-primary">smart_toy</span>
              </div>
              <div className="relative z-10">
                <p className="font-label text-[10px] font-bold text-primary mb-4 tracking-[0.2em] uppercase">{t.portalTitle}</p>
                <p className="font-body text-xl font-medium text-on-surface mb-8 leading-relaxed italic">"{t.portalPrompt}"</p>
                <div className="flex gap-0">
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePromptFromHome(); }}
                    className="flex-grow bg-surface-container-low border border-outline-variant border-r-0 focus:border-primary px-4 py-3 font-body text-sm outline-none text-on-surface placeholder:italic" 
                    placeholder={t.inquirePlaceholder} 
                    type="text"
                  />
                  <button 
                    onClick={handlePromptFromHome}
                    className="bg-primary text-on-primary px-6 flex items-center justify-center transition-all hover:bg-opacity-90 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">send</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* -------------------- CHAT SCREEN (Responsive centered & scroll layout) -------------------- */}
      {user && activeTab === "chat" && (
        <div className="page-enter flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-grow">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full pulse-animation"></div>
              <span className="font-label text-xs tracking-[0.2em] font-semibold text-primary uppercase">{t.systemOnline}</span>
            </div>
            <h2 className="font-display text-4xl text-on-surface font-bold mb-2">{t.agentTitle}</h2>
            <p className="font-body italic text-sm text-on-surface-variant max-w-md mx-auto">Tactical match-day instructions configured for {stadium}</p>
            <div className="w-16 h-px bg-outline-variant mx-auto mt-6"></div>
          </div>

          {/* Chat Messages Feed container */}
          <div className="space-y-10 mb-32 overflow-y-auto pr-2 flex-grow">
            {/* Mock messages */}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end self-end ml-16" : "items-start mr-16"} w-full`}
              >
                <div className={`font-label text-xs font-bold tracking-widest mb-2 uppercase ${msg.sender === "user" ? "text-on-surface-variant text-right" : "text-primary"}`}>
                  {msg.sender === "user" ? "Fan Access" : "Agent Alpha-1"}
                </div>
                <div className={`${msg.sender === "user" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest border border-outline-variant"} p-6 rounded-lg editorial-shadow`}>
                  <p className={`font-body text-lg leading-relaxed ${msg.sender === "user" ? "italic" : "text-on-surface"}`} dangerouslySetInnerHTML={{ __html: formatBoldText(msg.text) }} />
                </div>
              </div>
            ))}

            {/* Thinking panel for reasoning logs */}
            {isReasoning && (
              <div className="border border-primary/20 bg-primary/5 p-6 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary animate-spin text-sm">sync</span>
                    <span className="font-label text-xs font-bold tracking-widest text-primary uppercase">{t.synthesizing}</span>
                  </div>
                  <span className="font-label text-[10px] text-outline uppercase tracking-tighter">{t.latency}: 38ms</span>
                </div>
                <div className="space-y-2">
                  {reasoningLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between font-label text-[11px] border-b border-primary/10 pb-2 last:border-0 last:pb-0">
                      <span className="text-on-surface uppercase font-medium">
                        {log && typeof log === "string" && log.includes(":") ? log.split(":")[0] : log || ""}
                      </span>
                      <span className="text-primary font-bold">
                        {log && typeof log === "string" && log.includes(":") ? log.split(":")[1] : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tactical Map Card (renders after a query is completed or stays as assistant details) */}
            {messages.length > 1 && !isReasoning && (
              <div className="border border-outline-variant rounded-lg overflow-hidden editorial-shadow w-full max-w-[95%]">
                <div className="h-60 relative bg-surface-container-low overflow-hidden">
                  <img alt="Stadium Map" className="w-full h-full object-cover mix-blend-multiply opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWqY7qm4nmWkM30uMFdL5axlHk_-KToq8JPxLifcwqnwDhgA6gT7QTCZoTt6Zt-qr_nyzYa9M_udXHrFSsp-FQ1C24m9FDHuXZocbVOQv284IygCiq1Ds-6ykhIT8HSSpQyozj0f6xZnZmUcufwsaPUsYO4zzPA66alXnkyFneAK6Mg1YNqWfoGn8MzAUdYOaIMYk9SIGC0RLaC2kCcrzTDySVcxAMBo1UjlN4mGoEFZT6ASDMALdbwdXiTFUSy9fzztxzaFIpo1Y"/>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-primary text-on-primary font-label px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-xl">
                      Route Path: {itinerary?.gate} Entry
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest flex justify-between items-center">
                  <div>
                    <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">{t.navPath}</h4>
                    <p className="font-body text-sm font-bold text-on-surface">{itinerary?.gate} → Seating Sector</p>
                  </div>
                  <button 
                    onClick={() => setShowARHUD(true)}
                    className="bg-primary text-on-primary px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                  >
                    {t.launchAR}
                  </button>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input block (Sticky at bottom, but above navigation bar) */}
          <div className="fixed bottom-[68px] left-0 w-full bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant px-6 py-5 z-50">
            <div className="max-w-4xl mx-auto w-full">
              {/* Quick Prompts */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
                <button onClick={() => selectQuickChip(`Find a route avoiding crowd bottlenecks at ${stadium}`)} className="flex-shrink-0 border border-outline-variant px-4 py-2 rounded-full font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:border-primary transition-all cursor-pointer">
                  {t.avoidingCrowds}
                </button>
                <button onClick={() => selectQuickChip(`Where is the closest vegetarian option near ${itinerary?.gate || 'gates'}`)} className="flex-shrink-0 border border-outline-variant px-4 py-2 rounded-full font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:border-primary transition-all cursor-pointer">
                  {t.vegFoodNearA}
                </button>
                <button onClick={() => selectQuickChip(`Show emergency procedures and maps for ${stadium}`)} className="flex-shrink-0 border border-outline-variant px-4 py-2 rounded-full font-label text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low hover:border-primary transition-all cursor-pointer">
                  {t.emergencyExits}
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isReasoning}
                  className="flex-grow bg-surface-container-low border border-outline-variant rounded-xl p-4 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder={t.queryPlaceholder}
                  type="text"
                />
                <button 
                  type="submit"
                  disabled={isReasoning || !inputText.trim()}
                  className="bg-primary text-on-primary w-14 h-14 rounded-xl flex items-center justify-center editorial-shadow hover:bg-primary/90 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- STATS/LIVE SCREEN (Responsive centered bento grid layout) -------------------- */}
      {user && activeTab === "stats" && (
        <div className="page-enter flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-on-surface pb-6">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-1 block">{t.opsCenter}</span>
              <h2 className="font-display text-4xl font-light text-on-surface">{t.stadiumIntel}</h2>
            </div>
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="font-label text-xs uppercase tracking-widest">{itinerary?.stadium_name} // {itinerary?.city}</span>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full">
            {/* Stadium Heat Map (Bento Large md:col-span-8) */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant p-1 shadow-sm overflow-hidden group rounded-sm">
              <div className="relative h-full bg-white p-6 border border-outline-variant rounded-sm">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-label text-[10px] tracking-widest text-outline uppercase">{t.heatmapLabel}</span>
                  <div className="flex border border-outline-variant rounded-sm overflow-hidden">
                    <button 
                      onClick={() => setHeatmapView("zones")}
                      className={`font-label text-[10px] px-3 py-1.5 uppercase tracking-wider transition-colors ${heatmapView === "zones" ? "bg-primary text-on-primary font-bold" : "bg-surface text-on-surface hover:bg-surface-container"}`}
                    >
                      {t.zonesBtn}
                    </button>
                    <button 
                      onClick={() => setHeatmapView("infra")}
                      className={`font-label text-[10px] px-3 py-1.5 uppercase tracking-wider border-l border-outline-variant transition-colors ${heatmapView === "infra" ? "bg-primary text-on-primary font-bold" : "bg-surface text-on-surface hover:bg-surface-container"}`}
                    >
                      {t.infraBtn}
                    </button>
                  </div>
                </div>
                <div className="aspect-video w-full relative flex items-center justify-center overflow-hidden bg-surface-container-low border border-outline-variant rounded-sm">
                  <img className="w-full h-full object-contain opacity-50 grayscale hover:grayscale-0 transition-all duration-750" alt="Futuristic Stadium Heatmap Blueprint" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUCBT_ymWI2IYOyFE-p0lowBP4lVM7Lzf-NuJ32vkxguqUhq3o0CHPONY1ORHR8RH577UjIJCAr1SOmYM1ZxDq9AhuzKtnq3W2N_bd4ikOPVS-JjDzA60o2oLvZAY0_-dyzEIsHBtV_Z0-33Fx65SOsiegDKc0vHWqm6cR7Z6qD3kmuKSLjrq3gu-1fKF77PjGc1tEDNFPgsVchGaue3DGaKYjriC2etFIk_yN8gFUa-A1WFMGjYKkgQly7-ExcKyv2iG5S535aQQ"/>
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>

                  {/* Heat Map Hotspots Toggle */}
                  {heatmapView === "zones" ? (
                    (MOCK_STADIUMS[stadium]?.gates || []).map((gate) => {
                      const wait = gateTimes[gate] || 0;
                      const hotspot = GATE_HOTSPOTS[stadium]?.[gate] || { x: "50%", y: "50%" };
                      
                      let colorClass = "bg-[#10b981] shadow-[#10b981]/50"; // Green: low
                      let textLabel = "text-[#10b981]";
                      if (wait > 20) {
                        colorClass = "bg-[#f43f5e] shadow-[#f43f5e]/50"; // Red: high
                        textLabel = "text-[#f43f5e]";
                      } else if (wait >= 10) {
                        colorClass = "bg-[#f59e0b] shadow-[#f59e0b]/50"; // Yellow: medium
                        textLabel = "text-[#f59e0b]";
                      }
                      
                      return (
                        <div 
                          key={gate}
                          className="absolute cursor-pointer group"
                          style={{ left: hotspot.x, top: hotspot.y, transform: "translate(-50%, -50%)" }}
                          onClick={() => handleToggleQueue(gate, wait)}
                        >
                          {/* Pulse Ring */}
                          <div className={`absolute -inset-2.5 rounded-full opacity-75 animate-ping ${colorClass}`}></div>
                          {/* Dot Core */}
                          <div className={`relative w-4.5 h-4.5 rounded-full border-2 border-white shadow-md ${colorClass} transition-all duration-300 hover:scale-125`}></div>
                          
                          {/* Hotspot Tooltip */}
                          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-outline-variant p-2.5 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 rounded-md whitespace-nowrap text-center">
                            <p className="font-headline font-bold text-xs text-on-surface">{gate}</p>
                            <p className={`font-label text-[10px] font-bold uppercase tracking-wider ${textLabel}`}>{wait}m Wait</p>
                            <p className="font-label text-[8px] text-outline uppercase tracking-wider mt-0.5">Click to simulate change</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Infrastructure Hotspots */
                    [
                      { id: "restroom-1", label: "Restrooms (North)", x: "32%", y: "30%", icon: "wc", detail: "2m wait time", color: "bg-blue-500 shadow-blue-500/50 text-blue-500" },
                      { id: "restroom-2", label: "Restrooms (South)", x: "68%", y: "70%", icon: "wc", detail: "4m wait time", color: "bg-blue-500 shadow-blue-500/50 text-blue-500" },
                      { id: "medical-1", label: "Medical & First Aid", x: "50%", y: "15%", icon: "medical_services", detail: "Staffed // 0m wait", color: "bg-red-500 shadow-red-500/50 text-red-500" },
                      { id: "concession-1", label: itinerary?.food_stands?.[0]?.name || "Food Concourse", x: "38%", y: "60%", icon: "fastfood", detail: "8m wait time", color: "bg-orange-500 shadow-orange-500/50 text-orange-500" },
                      { id: "merch-1", label: "KhelMitra Fan Store", x: "62%", y: "40%", icon: "shopping_bag", detail: "Official Souvenirs", color: "bg-purple-500 shadow-purple-500/50 text-purple-500" }
                    ].map((infra) => {
                      return (
                        <div 
                          key={infra.id}
                          className="absolute cursor-pointer group"
                          style={{ left: infra.x, top: infra.y, transform: "translate(-50%, -50%)" }}
                        >
                          {/* Pulse Ring */}
                          <div className={`absolute -inset-2.5 rounded-full opacity-75 animate-ping ${infra.color.split(" ")[0]}`}></div>
                          
                          {/* Icon Dot Core */}
                          <div className={`relative w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-125 ${infra.color.split(" ")[0]} text-white`}>
                            <span className="material-symbols-outlined text-base">{infra.icon}</span>
                          </div>
                          
                          {/* Hotspot Tooltip */}
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-outline-variant p-2.5 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 rounded-md whitespace-nowrap text-center text-black">
                            <p className="font-headline font-bold text-xs">{infra.label}</p>
                            <p className={`font-label text-[10px] font-bold uppercase tracking-wider ${infra.color.split(" ")[2]}`}>{infra.detail}</p>
                            <p className="font-label text-[8px] text-outline uppercase tracking-wider mt-0.5">Location: Level 100 Concourse</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <div className="flex gap-12">
                    <div className="flex flex-col">
                      <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">{t.occupancyLabel}</span>
                      <span className="font-display text-3xl font-light text-on-surface">87,402</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label text-[10px] text-outline uppercase tracking-widest mb-1">{t.tempLabel}</span>
                      <span className="font-display text-3xl font-light text-primary">24°C</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      // Trigger a manual poll of both datasets
                      const activeStadium = stadium;
                      setStadium("");
                      setTimeout(() => setStadium(activeStadium), 50);
                    }}
                    className="bg-on-background text-background px-6 py-2.5 font-label text-[10px] uppercase tracking-[0.2em] border border-on-background hover:bg-transparent hover:text-on-background transition-all cursor-pointer rounded-sm"
                  >
                    {t.refreshDataBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Side Column (Gate Status & Simulator md:col-span-4) */}
            <div className="md:col-span-4 flex flex-col gap-8">
              {/* Gate Status Congestion list */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-sm rounded-sm">
                <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
                  <h3 className="font-display text-xl uppercase italic font-bold">{t.gateStatusHeader}</h3>
                  <span className="material-symbols-outlined text-outline">door_front</span>
                </div>
                <div className="space-y-6">
                  {(MOCK_STADIUMS[stadium]?.gates || []).map((gate) => {
                    const wait = gateTimes[gate] || 0;
                    const isHeavy = wait > 20;
                    const isModerate = wait >= 10 && wait <= 20;
                    
                    let badgeClass = "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20";
                    let badgeText = "Low Crowd";
                    if (isHeavy) {
                      badgeClass = "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20";
                      badgeText = "High Crowd";
                    } else if (isModerate) {
                      badgeClass = "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20";
                      badgeText = "Medium Crowd";
                    }

                    return (
                      <div key={gate} className="flex justify-between items-center border-b border-outline-variant/30 pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="font-display text-lg font-bold">{gate}</span>
                          <span className={`font-label text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 border rounded-sm ${badgeClass} inline-block w-max mt-1`}>
                            {badgeText}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`font-display text-3xl font-light ${isHeavy ? 'text-[#f43f5e]' : isModerate ? 'text-[#f59e0b]' : 'text-on-surface'}`}>{wait}m</span>
                          <p className="font-label text-[9px] uppercase text-outline tracking-wider">{t.waitLabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operations simulator control */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-sm rounded-sm">
                <h3 className="font-display text-base uppercase font-bold mb-3 flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <span>Operations Simulator</span>
                  <span className="material-symbols-outlined text-outline">tune</span>
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 italic">Adjust wait times manually to simulate crowd dynamics:</p>
                <div className="space-y-3">
                  {(MOCK_STADIUMS[stadium]?.gates || []).map((gate) => {
                    const wait = gateTimes[gate] || 0;
                    return (
                      <div key={gate} className="flex justify-between items-center bg-surface-container-low p-3 border border-outline-variant/30 rounded-sm">
                        <span className="font-label text-xs font-bold">{gate}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-sm font-semibold">{wait}m</span>
                          <button 
                            onClick={() => handleToggleQueue(gate, wait)}
                            className="bg-primary text-on-primary text-[9px] font-label px-2.5 py-1.5 uppercase tracking-wider hover:bg-opacity-95 cursor-pointer rounded-sm"
                          >
                            Toggle Queue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Crowd Trend Visualization Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 shadow-sm rounded-sm w-full">
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-4">
              <div>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block">Live Telemetry Analysis</span>
                <h3 className="font-display text-2xl uppercase italic font-bold">30-Minute Gate Wait Time Trend</h3>
              </div>
              <div className="flex items-center gap-2 text-outline">
                <span className="w-2.5 h-2.5 rounded-full bg-primary live-dot"></span>
                <span className="font-label text-xs uppercase tracking-widest">Real-Time MongoDB Stream</span>
              </div>
            </div>
            
            <div className="w-full overflow-hidden">
              {Object.keys(trendData).length > 0 ? (
                <div className="relative">
                  <svg viewBox="0 0 800 320" className="w-full h-auto overflow-visible">
                    <defs>
                      {/* Gradients for smooth trend graph area fills */}
                      {Object.keys(trendData).map((gate) => {
                        const gateColor = getGateColor(gate);
                        const cleanGateId = gate.replace(/\s+/g, '-');
                        return (
                          <linearGradient key={`grad-${gate}`} id={`gradient-${cleanGateId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={gateColor} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={gateColor} stopOpacity="0.0" />
                          </linearGradient>
                        );
                      })}
                    </defs>

                    {/* Grid Y-Axis Lines & Labels */}
                    {[0, 15, 30, 45, 60].map((val) => {
                      const y = 260 - (val / 60) * 220;
                      return (
                        <g key={val} className="opacity-10 dark:opacity-20">
                          <line x1="60" y1={y} x2="770" y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                          <text x="50" y={y + 4} textAnchor="end" className="fill-on-surface font-label text-[10px]">{val}m</text>
                        </g>
                      );
                    })}

                    {/* X-Axis labels (timestamps relative to now) */}
                    {[-30, -25, -20, -15, -10, -5, 0].map((val, idx) => {
                      const x = 60 + (idx / 6) * 710;
                      return (
                        <text key={idx} x={x} y="285" textAnchor="middle" className="fill-outline font-label text-[10px] opacity-70">
                          {val === 0 ? "Live" : `${val}m`}
                        </text>
                      );
                    })}

                    {/* Render trend lines */}
                    {Object.entries(trendData).map(([gate, points]) => {
                      if (!points || points.length === 0) return null;
                      
                      const gateColor = getGateColor(gate);
                      const maxIndex = points.length - 1;
                      
                      // Calculate path points
                      const coords = points.map((p, idx) => {
                        const x = 60 + (idx / maxIndex) * 710;
                        const val = Math.min(60, p.value);
                        const y = 260 - (val / 60) * 220;
                        return { x, y, value: p.value };
                      });

                      // Cubic Bezier spline formula for smooth chart lines
                      let pathD = `M ${coords[0].x} ${coords[0].y}`;
                      for (let i = 0; i < coords.length - 1; i++) {
                        const curr = coords[i];
                        const next = coords[i + 1];
                        const cpX1 = curr.x + (next.x - curr.x) / 3;
                        const cpY1 = curr.y;
                        const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
                        const cpY2 = next.y;
                        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
                      }

                      // Dynamic area fill
                      const areaD = `${pathD} L ${coords[coords.length - 1].x} 260 L ${coords[0].x} 260 Z`;
                      const cleanGateId = gate.replace(/\s+/g, '-');

                      return (
                        <g key={gate}>
                          {/* Shaded area */}
                          <path d={areaD} fill={`url(#gradient-${cleanGateId})`} className="transition-all duration-500" />
                          
                          {/* Glowing line path */}
                          <path d={pathD} fill="none" stroke={gateColor} strokeWidth="3" strokeLinecap="round" className="transition-all duration-500" />

                          {/* Interactive tooltips and dots */}
                          {coords.map((c, idx) => {
                            const isLast = idx === coords.length - 1;
                            return (
                              <g key={idx} className="group/dot">
                                {isLast ? (
                                  <>
                                    <circle cx={c.x} cy={c.y} r="8" fill={gateColor} className="animate-ping opacity-35" />
                                    <circle cx={c.x} cy={c.y} r="5" fill={gateColor} stroke="#ffffff" strokeWidth="2" />
                                  </>
                                ) : (
                                  <circle cx={c.x} cy={c.y} r="3" fill="#ffffff" stroke={gateColor} strokeWidth="1.5" className="transition-all duration-200 cursor-pointer hover:r-5" />
                                )}
                                
                                {/* Individual data point tooltip */}
                                <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                                  <rect x={c.x - 30} y={c.y - 35} width="60" height="22" rx="4" fill="#1e293b" />
                                  <text x={c.x} y={c.y - 20} textAnchor="middle" fill="#ffffff" className="font-label text-[10px] font-bold">{c.value}m</text>
                                </g>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Graph Legends */}
                  <div className="flex flex-wrap justify-center gap-6 mt-6 border-t border-outline-variant/30 pt-4">
                    {Object.keys(trendData).map((gate) => {
                      const wait = gateTimes[gate] || 0;
                      const gateColor = getGateColor(gate);
                      return (
                        <div key={gate} className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: gateColor }}></span>
                          <span className="font-headline text-xs font-bold text-on-surface">{gate}</span>
                          <span className="text-[10px] font-label text-outline font-bold uppercase">({wait}m wait)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-surface-container-low border border-outline-variant/30 rounded-sm">
                  <span className="material-symbols-outlined animate-spin text-primary text-2xl mr-2">sync</span>
                  <span className="font-label text-xs text-outline uppercase tracking-widest">Compiling wait-time analytics...</span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Agent advisory card */}
          <div className="bg-primary-container text-on-primary-container p-8 rounded-lg shadow-lg relative overflow-hidden w-full">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">{t.agentAdvisory}</span>
              </div>
              <p className="font-body text-base italic leading-relaxed mb-6 opacity-90">
                "Congestion sensors recommend entry through **${itinerary?.gate}** (${itinerary?.wait_time}m wait). Seating buffer cushion has dispatched departure buffer to **${itinerary?.cushion_time}m** prior kickoff."
              </p>
              <button 
                onClick={() => setShowRouteMap(true)} 
                className="max-w-xs w-full bg-on-primary-container text-primary-container py-3 font-label text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer rounded-sm"
              >
                Open Route Map
              </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">info</span>
            </div>
          </div>

          {/* Facility items bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
            <div className="bg-surface p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all rounded-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">wc</span>
                <span className="font-label text-[9px] text-outline tracking-[0.2em]">LEVEL 100</span>
              </div>
              <h4 className="font-display text-lg font-bold mb-4 uppercase tracking-tighter italic">{t.restrooms}</h4>
              <div className="w-full bg-surface-variant h-[1px] mb-4">
                <div className="bg-tertiary h-full w-[65%]"></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-label text-tertiary uppercase tracking-wider font-bold">Moderate</span>
                <span className="font-label text-outline">4m wait</span>
              </div>
            </div>

            <div className="bg-surface p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all rounded-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">fastfood</span>
                <span className="font-label text-[9px] text-outline tracking-[0.2em]">NORTH CONCOURSE</span>
              </div>
              <h4 className="font-display text-lg font-bold mb-4 uppercase tracking-tighter italic">{t.concessions}</h4>
              <div className="w-full bg-surface-variant h-[1px] mb-4">
                <div className="bg-error h-full w-[90%]"></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-label text-error uppercase tracking-wider font-bold">Heavy</span>
                <span className="font-label text-outline">15m wait</span>
              </div>
            </div>

            <div className="bg-surface p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all rounded-sm">
              <div className="flex justify-between items-start mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
                <span className="font-label text-[9px] text-outline tracking-[0.2em]">PLAZA LEVEL</span>
              </div>
              <h4 className="font-display text-lg font-bold mb-4 uppercase tracking-tighter italic">{t.officialGear}</h4>
              <div className="w-full bg-surface-variant h-[1px] mb-4">
                <div className="bg-primary h-full w-[20%]"></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-label text-primary uppercase tracking-wider font-bold">Clear</span>
                <span className="font-label text-outline">0m wait</span>
              </div>
            </div>

            {/* Live Announcements Ticker */}
            <div className="bg-white border-l-4 border-primary p-6 shadow-sm overflow-hidden relative rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface">{t.announcements}</span>
              </div>
              <div className="space-y-4">
                <div className="border-b border-outline-variant/30 pb-3">
                  <p className="font-label text-[9px] text-outline uppercase mb-1">18:42 UTC</p>
                  <p className="text-xs font-body italic leading-snug">National Anthem rehearsal scheduled for 10min.</p>
                </div>
                <div>
                  <p className="font-label text-[9px] text-outline uppercase mb-1">18:35 UTC</p>
                  <p className="text-xs font-body italic leading-snug">Shuttle Line 4 operating with 5min delay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ITINERARY & HISTORY TAB (Responsive centered layout) -------------------- */}
      {user && activeTab === "itinerary" && (
        <div className="page-enter flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          <header className="mb-12 border-b border-on-surface/10 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <p className="caps-label text-[10px] text-primary">Live Intelligence Active</p>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-on-surface leading-[1.1] mb-6">
              Match-Day <span className="italic font-normal">Itinerary</span>
            </h2>
            <p className="text-on-surface-variant max-w-lg leading-relaxed italic text-sm">
              Your curated schedule for today's sporting events. High-priority alerts are synchronized with your stadium seating.
            </p>
          </header>

          {/* Sub-Tab navigation toggle */}
          <div className="flex border border-outline-variant rounded-sm overflow-hidden w-full mb-8">
            <button 
              id="subtab-active"
              onClick={() => setItinerarySubTab("active")} 
              className={`flex-1 font-label text-xs py-3 uppercase tracking-wider transition-colors cursor-pointer ${itinerarySubTab === "active" ? "bg-primary text-on-primary font-bold" : "bg-surface text-on-surface"}`}
            >
              {t.liveItinerary}
            </button>
            <button 
              id="subtab-history"
              onClick={() => setItinerarySubTab("history")} 
              className={`flex-1 font-label text-xs py-3 uppercase tracking-wider transition-colors border-l border-outline-variant cursor-pointer ${itinerarySubTab === "history" ? "bg-primary text-on-primary font-bold" : "bg-surface text-on-surface"}`}
            >
              {t.matchArchive}
            </button>
            <button 
              id="subtab-feedback"
              onClick={() => setItinerarySubTab("feedback")} 
              className={`flex-1 font-label text-xs py-3 uppercase tracking-wider transition-colors border-l border-outline-variant cursor-pointer ${itinerarySubTab === "feedback" ? "bg-primary text-on-primary font-bold" : "bg-surface text-on-surface"}`}
            >
              Feedback
            </button>
          </div>

          {/* Sub-Tab 1: Live Calculated Itinerary */}
          {itinerarySubTab === "active" && !itinerary && (
            <div className="text-center py-16 border border-dashed border-outline-variant bg-surface-container-lowest flex flex-col items-center justify-center rounded-sm">
              <span className="material-symbols-outlined text-outline text-5xl mb-4">info</span>
              <h3 className="font-display text-xl text-on-surface mb-2">No Active Itinerary</h3>
              <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-8">
                Go to the **Chat** tab to query KhelMitra AI and compile your personalized travel itinerary, or adjust your settings to generate one.
              </p>
              <button 
                onClick={() => setActiveTab("chat")} 
                className="bg-primary text-on-primary font-label text-[10px] px-6 py-3 uppercase tracking-[0.15em] hover:bg-opacity-90 rounded-sm font-bold cursor-pointer transition-all"
              >
                Go to Chat Agent
              </button>
            </div>
          )}

          {itinerarySubTab === "active" && itinerary && (
            <div className="space-y-12">
              {/* Journey card */}
              <article className="group">
                <div className="flex justify-between items-baseline mb-4 border-b border-outline-variant pb-2">
                  <span className="caps-label text-[11px] text-on-surface-variant">Planning // 01</span>
                  <span className="material-symbols-outlined text-on-surface-variant font-light">train</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8">
                    <h3 className="font-display text-3xl mb-4 italic">{t.journey}</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed mb-6">{itinerary.travel_route}</p>
                    <div className="flex gap-12 border-t border-outline-variant/30 pt-6">
                      <div>
                        <p className="caps-label text-[10px] text-on-surface-variant mb-2">{t.departure}</p>
                        <p className="font-display text-2xl text-on-surface">17:15</p>
                      </div>
                      <div>
                        <p className="caps-label text-[10px] text-on-surface-variant mb-2">{t.duration}</p>
                        <p className="font-display text-2xl text-on-surface">{itinerary.travel_time_minutes} min</p>
                      </div>
                      <div>
                        <p className="caps-label text-[10px] text-on-surface-variant mb-2">{t.transport}</p>
                        <p className="caps-label text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-sm inline-block">Transit Metro</p>
                      </div>
                      <div>
                        <p className="caps-label text-[10px] text-on-surface-variant mb-2">MAP VIEW</p>
                        <button 
                          onClick={() => setShowRouteMap(true)}
                          className="flex items-center gap-1.5 text-primary hover:text-primary-dark font-label text-[11px] font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">map</span>
                          ROUTE MAP
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-4 bg-surface-container-low p-4 border border-outline-variant/20 rounded-lg flex items-center">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-xl">info</span>
                      <p className="text-xs text-on-surface-variant leading-normal">Shuttle operations report normal flow. Next arrival in <span className="text-on-surface font-semibold">4 mins</span>.</p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Stadium entry gate status */}
              <article>
                <div className="flex justify-between items-baseline mb-4 border-b border-outline-variant pb-2">
                  <span className="caps-label text-[11px] text-on-surface-variant">Real-Time // 02</span>
                  <span className="material-symbols-outlined text-on-surface-variant font-light">sensor_door</span>
                </div>
                <h3 className="font-display text-3xl mb-6 italic">Stadium Access</h3>
                <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="caps-label text-[10px] text-on-surface">{t.crowdDensity}</p>
                        <p className="font-display text-lg">
                          {itinerary.wait_time > 20 ? "Heavy" : itinerary.wait_time > 10 ? "Moderate" : "Optimal"}
                        </p>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.max(10, itinerary.wait_time * 2.2))}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-4 italic">Sensors monitoring queues at {itinerary.gate}.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-surface-container p-4 border border-outline-variant/30 rounded-lg text-center">
                        <p className="caps-label text-[10px] text-on-surface-variant mb-1">{t.gate}</p>
                        <p className="font-display text-2xl font-bold">{itinerary.gate}</p>
                      </div>
                      <div className="flex-1 bg-primary text-on-primary p-4 rounded-lg text-center shadow-sm">
                        <p className="caps-label text-[10px] opacity-80 mb-1">{t.estWait}</p>
                        <p className="font-display text-2xl font-bold">{itinerary.wait_time}m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Concessions details */}
              <article>
                <div className="flex justify-between items-baseline mb-4 border-b border-outline-variant pb-2">
                  <span className="caps-label text-[11px] text-on-surface-variant">Provisioning // 03</span>
                  <div className="flex items-center gap-2">
                    <span className="caps-label text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">{t.dietaryMatch}</span>
                    <span className="material-symbols-outlined text-on-surface-variant font-light">restaurant</span>
                  </div>
                </div>
                <div className="group flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-48 aspect-square border border-outline-variant p-1 rounded-sm bg-white overflow-hidden shadow-sm flex-shrink-0">
                    <img className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Concession stand burger" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTLtexfHHXbgSVTDFx7IHx6ZzPMgy6gVdcNUAZe7-jeOogXN1No1Xo3w5e0a3dD0GC1pN1RKnV6e6vVMpbvyraL8DYuyizYhBxo9SNBQdE2-e1njnYnqb_6xahnCUzHhkxG6bNWHjARWu_X8J9QsDXyfv0MRJpOKRWESzwcOE6DkWryC84ZTWbur8pyG0XDWTLazFA1PNVCvlBLd23Kv84cLjonU8LJekYzSoKLbx3fC9EwuAzTxk4Z88sWedApN5us91j6QesUsQ"/>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h4 className="font-display text-3xl text-on-surface mb-1">{itinerary.food_stands[0].name}</h4>
                      <p className="caps-label text-[12px] text-primary font-bold">{itinerary.food_stands[0].tags.join(" • ").toUpperCase()}</p>
                      <p className="text-sm text-on-surface-variant mt-1 italic">{itinerary.food_stands[0].menu}</p>
                    </div>
                    <button 
                      onClick={() => handleOpenPreOrder()}
                      className="bg-on-surface text-surface px-8 py-3 font-display italic text-lg hover:bg-primary hover:text-white transition-all shadow-md active:scale-95 cursor-pointer rounded-sm"
                    >
                      {t.preOrderNow}
                    </button>
                  </div>
                </div>
              </article>

              {/* Curator advice card */}
              <article className="bg-primary text-on-primary p-10 rounded-2xl shadow-xl relative overflow-hidden w-full">
                <div className="absolute -right-12 -top-12 opacity-10">
                  <span className="material-symbols-outlined text-[160px]">smart_toy</span>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/20">
                    <span className="caps-label text-[10px] opacity-80">{t.curatorRecommendation}</span>
                    <span className="caps-label text-[10px] opacity-80">REF: SMART-DAY</span>
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl mb-6 leading-tight italic">
                    "Arrive early to clear security queues"
                  </h3>
                  <p className="text-lg leading-relaxed opacity-90 max-w-2xl font-light">
                    Based on your crowd sensitivity calibration is set to **{getCrowdLabel(crowdSliderVal)}**, a cushion buffer of **{itinerary.cushion_time} minutes** was factored in. Entry through {itinerary.gate} avoids North ramp queue bottlenecks.
                  </p>
                </div>
              </article>
            </div>
          )}

          {/* Sub-Tab 2: Archive/History */}
          {itinerarySubTab === "history" && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-bold">Past Match Itineraries</h3>
                <div className="space-y-4">
                  {historyItems.map((item) => (
                    <div key={item.id} className="group bg-surface-container-lowest border border-outline-variant p-6 hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-label text-[10px] font-bold border border-primary text-primary px-2 py-0.5 tracking-wider rounded-sm">COMPLETED</span>
                          <span className="font-label text-[11px] text-on-surface-variant tracking-wide">{item.date}</span>
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.match}</h3>
                        <p className="font-body text-sm text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {item.venue}
                        </p>
                      </div>
                      <div className="flex items-center gap-10">
                        <div>
                          <span className="font-display text-base font-bold block text-on-surface-variant">{item.amount}</span>
                          <span className="font-label text-[9px] text-outline uppercase font-bold tracking-widest">{item.type}</span>
                        </div>
                        <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">arrow_forward</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bento grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-surface-container-low border border-outline-variant p-8 rounded-sm">
                  <h3 className="font-display text-3xl font-bold mb-8">Saved Travel Plans</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-surface-container-lowest border border-outline-variant p-5 hover:border-primary transition-colors cursor-pointer rounded-sm">
                      <span className="font-label text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-2 block font-bold">IPL Finals</span>
                      <h4 className="font-display text-xl font-bold leading-tight mb-4">Mumbai Trip</h4>
                      <div className="flex justify-between items-center">
                        <span className="font-body italic text-sm text-on-surface-variant">4 Events</span>
                        <span className="material-symbols-outlined text-primary text-xl">open_in_new</span>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant p-5 hover:border-primary transition-colors cursor-pointer rounded-sm">
                      <span className="font-label text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-2 block font-bold">Group Stage</span>
                      <h4 className="font-display text-xl font-bold leading-tight mb-4">Ahmedabad Adventure</h4>
                      <div className="flex justify-between items-center">
                        <span className="font-body italic text-sm text-on-surface-variant">2 Events</span>
                        <span className="material-symbols-outlined text-primary text-xl">open_in_new</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary text-on-primary p-8 flex flex-col justify-between rounded-sm">
                  <div>
                    <span className="font-label text-[10px] font-bold text-on-primary/80 uppercase tracking-widest mb-3 block">DIGITAL CURATOR</span>
                    <h3 className="font-display text-2xl font-bold mb-6 leading-tight">Recommended For You</h3>
                    <div className="space-y-6">
                      <div className="border-b border-on-primary/20 pb-4">
                        <p className="font-display text-lg font-bold mb-1">Fan Fest: Bengaluru Node</p>
                        <p className="font-body italic text-xs text-on-primary/70">Based on stadium favorites</p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold mb-1">Exclusive: Puma Bengaluru</p>
                        <p className="font-body italic text-xs text-on-primary/70">Matching high-octane setup</p>
                      </div>
                    </div>
                  </div>
                  <button className="mt-8 w-full border border-on-primary/40 text-on-primary font-label text-xs py-3 uppercase tracking-widest hover:bg-on-primary hover:text-primary transition-all cursor-pointer rounded-sm">
                    Explore All
                  </button>
                </div>
              </div>

              {/* Favorite Stadiums */}
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-bold">Favorite Stadiums</h3>
                <div className="flex overflow-x-auto gap-8 pb-4 no-scrollbar scroll-smooth">
                  <div className="min-w-[300px] group cursor-pointer bg-surface-container-lowest border border-outline-variant p-3 rounded-sm">
                    <div className="h-[200px] w-full overflow-hidden mb-4 relative rounded-sm">
                      <img alt="Wankhede Stadium" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWImRZ8jSx01SPgDaqznY0SFWgYU1K70AYyl4UqdV52bXsaG5D0NCoN6Uc6b0kxC_3gZtd8GJ5f_zKc55jNtSp7On708HxZJaLMC1L7CuzkWJC3rbhUZu7_7rcalrBo9wXekKyJFoZT6Of2LNscUWtDM_7gRB2-vTuPRPiUNqF_3IVpQcT_WZzoIihM5hVUBsnmupb5CZ8zAQpzh8R5AIL99tjuLab2oP5d3JghwQHgpUS6uf3y7yXeaWvS8_u3cksi0QxXwj6-UA"/>
                      <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm border border-outline-variant p-2 rounded-full">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-xl font-bold">Wankhede Stadium</h4>
                        <span className="font-label text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">Mumbai, MH</span>
                      </div>
                      <span className="font-label text-[10px] font-bold border border-outline-variant text-on-surface-variant px-2 py-0.5 rounded-sm">4 VISITS</span>
                    </div>
                  </div>

                  <div className="min-w-[300px] group cursor-pointer bg-surface-container-lowest border border-outline-variant p-3 rounded-sm">
                    <div className="h-[200px] w-full overflow-hidden mb-4 relative rounded-sm">
                      <img alt="Narendra Modi Stadium" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3P1PH06qSruMMsmqfxXaoazj9WcTgQ1ksHFmbaX33vPJK4QoEigSenWjk6BOt9tydtcguVdKLsM0sI8GKtgtKrRnOySXF3CfPJghEGDOohESKwVRyHq859sg9nUtYuNPcB1oGWqnRzdFdWsLxpWqKyfN0tWSnfs4LmmFDITkwW9knqwIVGYHs8b5NtiiKMBAyF0AJe4mySDsBYdCX1De4ccoz9V4CK4hE6NcQuakhcU8-oFQWI0db-au3YaupwAvXzOxP9LaJq_k"/>
                      <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm border border-outline-variant p-2 rounded-full">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-xl font-bold">Narendra Modi Stadium</h4>
                        <span className="font-label text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">Ahmedabad, GJ</span>
                      </div>
                      <span className="font-label text-[10px] font-bold border border-outline-variant text-on-surface-variant px-2 py-0.5 rounded-sm">2 VISITS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {itinerarySubTab === "feedback" && (
            <Feedback user={user} itinerary={itinerary} />
          )}
        </div>
      )}

      {/* -------------------- LANDING PAGE SCREEN -------------------- */}
      {(!user && activeTab !== "signin" && activeTab !== "signup" && activeTab !== "forgotpassword") && (
        <LandingPage 
          onSignIn={() => setActiveTab("signin")}
          onSignUp={() => setActiveTab("signup")}
        />
      )}

      {/* -------------------- SIGN IN SCREEN -------------------- */}
      {activeTab === "signin" && (
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <SignIn
            onSignInSuccess={(usernameVal, token) => {
              // Fetch user profile
              fetch("/auth/profile", {
                headers: { "Authorization": `Bearer ${token}` }
              })
              .then(res => res.json())
              .then(userData => {
                setUser(userData);
                setUsername(userData.username);
                if (userData.dietary_preferences) {
                  setDiet(userData.dietary_preferences);
                }
                if (userData.crowd_tolerance) {
                  const val = userData.crowd_tolerance === "low" ? 20 : userData.crowd_tolerance === "medium" ? 50 : 80;
                  setCrowdSliderVal(val);
                }
                setActiveTab("home");
              });
            }}
            onNavigateToSignUp={() => setActiveTab("signup")}
            onNavigateToForgotPassword={() => setActiveTab("forgotpassword")}
          />
        </div>
      )}

      {/* -------------------- SIGN UP SCREEN -------------------- */}
      {activeTab === "signup" && (
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <SignUp
            onSignUpSuccess={() => {
              alert("Account created successfully! Please sign in.");
              setActiveTab("signin");
            }}
            onNavigateToSignIn={() => setActiveTab("signin")}
          />
        </div>
      )}

      {/* -------------------- FORGOT PASSWORD SCREEN -------------------- */}
      {activeTab === "forgotpassword" && (
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <ForgotPassword
            onNavigateToSignIn={() => setActiveTab("signin")}
          />
        </div>
      )}

      {/* -------------------- PROFILE SCREEN -------------------- */}
      {user && activeTab === "profile" && (
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <Profile
            user={user}
            onUpdateSuccess={(updatedUser) => {
              setUser(updatedUser);
              setUsername(updatedUser.username);
              if (updatedUser.dietary_preferences) {
                setDiet(updatedUser.dietary_preferences);
              }
              if (updatedUser.crowd_tolerance) {
                const val = updatedUser.crowd_tolerance === "low" ? 20 : updatedUser.crowd_tolerance === "medium" ? 50 : 80;
                setCrowdSliderVal(val);
              }
            }}
            onLogout={() => {
              localStorage.removeItem("token");
              setUser(null);
              setUsername("Alex_Martinez_26");
              setDiet(["vegetarian"]);
              setCrowdSliderVal(50);
              setActiveTab("landing");
            }}
            language={language}
            handleLanguageChange={handleLanguageChange}
            stadium={stadium}
            setStadium={setStadium}
            MOCK_STADIUMS={MOCK_STADIUMS}
            matchAlertsActive={matchAlertsActive}
            setMatchAlertsActive={setMatchAlertsActive}
            liveScoresActive={liveScoresActive}
            setLiveScoresActive={setLiveScoresActive}
            onResetArchive={() => {
              setDiet([]);
              setCrowdSliderVal(50);
              setStadium("Wankhede Stadium Mumbai");
              setLanguage("en");
              setUsername("Alex_Martinez_26");
              alert("Personal preferences reset to defaults.");
            }}
            onDeactivateId={() => {
              alert("Deactivating global fan ID profile.");
            }}
            t={t}
          />
        </div>
      )}

      {/* -------------------- FLOATING AR ASSISTANT SHORTCUT (Mobile only style) -------------------- */}
      {activeTab !== "chat" && (
        <button 
          onClick={() => setActiveTab("chat")} 
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex md:hidden items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">smart_toy</span>
        </button>
      )}

      {/* -------------------- BOTTOM TAB BAR Navigation -------------------- */}
      {user && (
        <nav className="fixed bottom-0 left-0 w-full z-[60] bg-surface/95 backdrop-blur-md border-t border-outline-variant">
          <div className="max-w-xl mx-auto flex justify-around items-center px-4 py-3">
            <button 
              onClick={() => setActiveTab("home")} 
              className={`flex flex-col items-center justify-center p-2 cursor-pointer group transition-all relative ${activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : undefined }}>home</span>
              <span className="font-label text-[10px] font-bold uppercase mt-1 tracking-wider">Home</span>
              {activeTab === 'home' && <div className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"></div>}
            </button>
            
            <button 
              onClick={() => setActiveTab("chat")} 
              className={`flex flex-col items-center justify-center p-2 cursor-pointer group transition-all relative ${activeTab === 'chat' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: activeTab === 'chat' ? "'FILL' 1" : undefined }}>smart_toy</span>
              <span className="font-label text-[10px] font-bold uppercase mt-1 tracking-wider">Agent</span>
              {activeTab === 'chat' && <div className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"></div>}
            </button>

            <button 
              onClick={() => setActiveTab("stats")} 
              className={`flex flex-col items-center justify-center p-2 cursor-pointer group transition-all relative ${activeTab === 'stats' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: activeTab === 'stats' ? "'FILL' 1" : undefined }}>dashboard</span>
              <span className="font-label text-[10px] font-bold uppercase mt-1 tracking-wider">Stats</span>
              {activeTab === 'stats' && <div className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"></div>}
            </button>

            <button 
              onClick={() => setActiveTab("itinerary")} 
              className={`flex flex-col items-center justify-center p-2 cursor-pointer group transition-all relative ${activeTab === 'itinerary' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: activeTab === 'itinerary' ? "'FILL' 1" : undefined }}>history</span>
              <span className="font-label text-[10px] font-bold uppercase mt-1 tracking-wider">Itinerary</span>
              {activeTab === 'itinerary' && <div className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"></div>}
            </button>

            <button 
              onClick={() => setActiveTab(user ? "profile" : "signin")} 
              className={`flex flex-col items-center justify-center p-2 cursor-pointer group transition-all relative ${activeTab === (user ? 'profile' : 'signin') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: activeTab === (user ? 'profile' : 'signin') ? "'FILL' 1" : undefined }}>person</span>
              <span className="font-label text-[10px] font-bold uppercase mt-1 tracking-wider">{user ? "Profile" : "Login"}</span>
              {activeTab === (user ? 'profile' : 'signin') && <div className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"></div>}
            </button>
          </div>
        </nav>
      )}

      {/* AR HUD MODAL OVERLAY */}
      {showARHUD && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-between p-6 overflow-hidden">
          {/* Background simulated camera view with neon tint */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
              alt="AR HUD Live Stadium Camera View" 
              className="w-full h-full object-cover opacity-30 scale-105 filter hue-rotate-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBawsQm2A8uKVPTTkGrrWo27DDMLeTSZwZS_s_ouH-tSAdGdID5CJtZeiJfUDkN0-tG2-OvcU_zvrFCvMO0WioLWAQ_imb03X-uMSpcdSriP9L2ltQiaNkIj2v_a56cBqCxdC0MROOF_1Mc6KLg65LwZ7aEOf2GynEZiSREFtrNwBpofK40lrV9q7CbwqtfHrSC1KXvqQNOoNa9CO4uiqEAC8MSvv2dY8C_D6h4vTK_Gv1T-1bYcNidQa_08ok-7Xk9ZAsRSUG0aCk"
            />
            {/* Futuristic Grid / Scanlines Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 via-transparent to-[#10b981]/5"></div>
            {/* Scanning laser line */}
            <div className="absolute left-0 w-full h-[2px] bg-[#10b981] opacity-40 shadow-[0_0_10px_#10b981] animate-pulse" style={{ top: "45%" }}></div>
          </div>

          {/* Top HUD bar */}
          <div className="relative z-10 flex flex-col items-center w-full gap-2 mt-4 text-[#10b981]">
            <div className="flex justify-between items-center w-full max-w-4xl border-b border-[#10b981]/30 pb-3">
              <span className="font-label text-xs font-bold tracking-[0.2em] uppercase">SYSTEM: KHELMITRA AR HUD v2.4</span>
              <span className="font-label text-xs font-bold tracking-[0.15em] uppercase">GPS: LATENCY 8ms (DGPS ACTIVE)</span>
            </div>
            {/* Compass Tape */}
            <div className="w-full max-w-lg bg-black/40 border border-[#10b981]/20 p-2 text-center rounded backdrop-blur-sm relative overflow-hidden h-10 flex items-center justify-center">
              <div className="font-label text-xs tracking-[0.4em] text-[#10b981]/70 whitespace-nowrap">
                230 · · · 240 · · · W · · · 280 · · · <span className="text-[#10b981] font-extrabold border border-[#10b981] px-1.5 py-0.5 bg-[#10b981]/10">NW 292°</span> · · · 300 · · · 310 · · · N
              </div>
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
            </div>
          </div>

          {/* Viewfinder crosshairs & guides */}
          <div className="relative z-10 flex-grow flex items-center justify-center">
            <div className="w-80 h-80 max-w-full relative flex items-center justify-center">
              {/* Corner viewfinders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#10b981]"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#10b981]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#10b981]"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#10b981]"></div>

              {/* Crosshair target */}
              <div className="w-24 h-24 border border-dashed border-[#10b981]/40 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border border-[#10b981]/60 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Simulated Floating AR Navigation pointers */}
              <div className="absolute left-[10%] top-[40%] flex flex-col items-center animate-bounce">
                <span className="material-symbols-outlined text-[#10b981] text-4xl font-extrabold drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">arrow_downward</span>
                <span className="bg-[#10b981] text-black font-label text-[9px] font-bold px-2 py-1 uppercase mt-1 tracking-wider whitespace-nowrap shadow-lg">GATE ACCESS PATH</span>
              </div>

              <div className="absolute right-[15%] bottom-[20%] flex flex-col items-center">
                <div className="bg-[#10b981]/90 text-black border border-[#10b981] p-2.5 shadow-xl rounded whitespace-nowrap text-center">
                  <p className="font-headline font-bold text-[10px] uppercase">SEATING SECTION E</p>
                  <p className="font-label text-[8px] font-medium mt-0.5 text-black/80">Turn Right at Corridor 3 (85m)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom HUD panel */}
          <div className="relative z-10 flex flex-col items-center w-full gap-5 mb-4">
            <div className="w-full max-w-4xl bg-black/60 border border-[#10b981]/30 p-5 rounded backdrop-blur-md text-[#10b981] grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center sm:text-left">
                <p className="font-label text-[9px] text-[#10b981]/60 uppercase tracking-widest">ACTIVE DESTINATION</p>
                <p className="font-headline text-lg font-bold uppercase">{stadium}</p>
              </div>
              <div className="text-center">
                <p className="font-label text-[9px] text-[#10b981]/60 uppercase tracking-widest">GATE QUEUE</p>
                <p className="font-headline text-lg font-bold uppercase">{itinerary?.gate} // {itinerary?.wait_time} MIN WAIT</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-label text-[9px] text-[#10b981]/60 uppercase tracking-widest">COMPASS</p>
                <p className="font-headline text-lg font-bold uppercase">SEC-3B // ROW 14</p>
              </div>
            </div>

            <button 
              onClick={() => setShowARHUD(false)}
              className="w-full max-w-md bg-[#10b981] text-black border border-[#10b981] py-4 rounded font-label text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-[#10b981] hover:border-[#10b981] transition-all cursor-pointer text-center font-bold"
            >
              CLOSE AR HUD
            </button>
          </div>
        </div>
      )}

      {/* ROUTE MAP MODAL */}
      {showRouteMap && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant w-full max-w-5xl h-[85vh] flex flex-col md:flex-row rounded-lg overflow-hidden shadow-2xl relative">
            {/* Close Button */}
            <button 
              onClick={() => setShowRouteMap(false)}
              className="absolute top-4 right-4 z-50 bg-surface-container border border-outline-variant hover:bg-primary hover:text-white transition-all w-9 h-9 flex items-center justify-center rounded-full cursor-pointer text-on-surface"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            {/* Left Column: Route/Stadium Info */}
            <div className="w-full md:w-[35%] bg-surface-container-low p-8 flex flex-col justify-between border-r border-outline-variant text-on-surface">
              <div className="space-y-8">
                <div>
                  <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold block mb-1">STADIUM ROUTE MAP</span>
                  <h3 className="font-display text-2xl font-bold leading-tight">{stadium}</h3>
                  <p className="font-body text-xs text-on-surface-variant italic mt-1">{itinerary?.city}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                    <div>
                      <p className="font-label text-[10px] text-outline uppercase tracking-wider">Coordinates</p>
                      <p className="font-body text-sm font-semibold">
                        {STADIUM_COORDS[stadium] ? `${STADIUM_COORDS[stadium].lat.toFixed(4)}° N, ${STADIUM_COORDS[stadium].lon.toFixed(4)}° E` : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-outline-variant/30 pt-4">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">directions_transit</span>
                    <div>
                      <p className="font-label text-[10px] text-outline uppercase tracking-wider">Recommended Route</p>
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{itinerary?.travel_route}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-outline-variant/30 pt-4">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                    <div>
                      <p className="font-label text-[10px] text-outline uppercase tracking-wider">Departure Offset Cushion</p>
                      <p className="font-body text-sm font-semibold">{itinerary?.cushion_time} mins before kickoff</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-outline-variant/30 pt-6">
                <div className="flex justify-between items-center bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div>
                    <p className="font-label text-[9px] text-outline uppercase tracking-wider">Travel Time</p>
                    <p className="font-display text-xl font-bold text-primary">{itinerary?.travel_time_minutes} min</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label text-[9px] text-outline uppercase tracking-wider">Queue Wait</p>
                    <p className="font-display text-xl font-bold text-primary">{itinerary?.wait_time} min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Google Maps Live Visualization */}
            <div className="flex-grow h-full bg-surface-container-high relative">
              <StadiumMap stadium={stadium} gateTimes={gateTimes} />
            </div>
          </div>
        </div>
      )}

      {/* PRE-ORDER CONCESSIONS MODAL */}
      {showPreOrderModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant w-full max-w-lg rounded-lg overflow-hidden shadow-2xl relative p-8 text-on-surface">
            {/* Close button */}
            <button 
              onClick={() => setShowPreOrderModal(false)}
              className="absolute top-4 right-4 bg-surface-container border border-outline-variant hover:bg-primary hover:text-white transition-all w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-on-surface"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            {preOrderStep === "cart" ? (
              <div className="space-y-6">
                <div>
                  <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold block mb-1">CONCESSIONS PORTAL</span>
                  <h3 className="font-display text-2xl font-bold italic">{itinerary?.food_stands?.[0]?.name}</h3>
                  <p className="text-xs text-on-surface-variant italic mt-1 font-medium">Pre-order regional Indian flavors for express collection.</p>
                </div>

                {/* Menu Items List */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                  {itinerary?.food_stands?.[0]?.menu.split(", ").map((item) => {
                    const qty = preOrderQuantities[item] || 0;
                    const price = MENU_PRICES[item] || 60;
                    return (
                      <div key={item} className="flex justify-between items-center border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-headline font-bold text-sm">{item}</p>
                          <p className="font-label text-xs text-outline font-bold mt-0.5">₹{price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if (qty > 0) {
                                setPreOrderQuantities(prev => ({ ...prev, [item]: qty - 1 }));
                              }
                            }}
                            disabled={qty === 0}
                            className="w-7 h-7 bg-surface-container border border-outline-variant hover:border-primary disabled:opacity-50 transition-colors flex items-center justify-center rounded cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="font-display text-sm font-bold w-6 text-center">{qty}</span>
                          <button 
                            onClick={() => {
                              setPreOrderQuantities(prev => ({ ...prev, [item]: qty + 1 }));
                            }}
                            className="w-7 h-7 bg-surface-container border border-outline-variant hover:border-primary transition-colors flex items-center justify-center rounded cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals Summary */}
                {(() => {
                  const subtotal = Object.entries(preOrderQuantities).reduce((acc, [item, qty]) => {
                    return acc + qty * (MENU_PRICES[item] || 60);
                  }, 0);
                  const tax = Math.round(subtotal * 0.05); // 5% GST
                  const total = subtotal + tax;

                  return (
                    <div className="border-t border-outline-variant/50 pt-4 space-y-2.5">
                      <div className="flex justify-between text-xs text-on-surface-variant font-label">
                        <span>SUBTOTAL</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-on-surface-variant font-label border-b border-outline-variant/30 pb-2">
                        <span>GST (5%)</span>
                        <span>₹{tax}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold font-headline pt-1">
                        <span>TOTAL</span>
                        <span className="text-primary">₹{total}</span>
                      </div>

                      <button 
                        onClick={() => {
                          if (total > 0) {
                            setPreOrderStep("success");
                          }
                        }}
                        disabled={total === 0}
                        className="w-full bg-primary text-on-primary py-3.5 rounded font-label text-xs font-bold uppercase tracking-widest hover:bg-primary/95 disabled:opacity-50 transition-all cursor-pointer text-center mt-4 font-bold"
                      >
                        PLACE PRE-ORDER
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Success Screen */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-full mx-auto">
                  <span className="material-symbols-outlined text-primary text-3xl font-extrabold animate-bounce">check</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">Pre-order Confirmed!</h3>
                  <p className="text-xs text-on-surface-variant italic mt-1">Payment processed successfully via UPI.</p>
                </div>

                {/* QR Code Simulation */}
                <div className="w-40 h-40 bg-white border border-outline-variant p-3 mx-auto flex flex-col justify-between items-center rounded shadow-sm">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                    {/* Border pattern */}
                    <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                    <rect x="5" y="5" width="15" height="15" fill="white" />
                    <rect x="10" y="10" width="5" height="5" fill="currentColor" />

                    <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                    <rect x="80" y="5" width="15" height="15" fill="white" />
                    <rect x="85" y="10" width="5" height="5" fill="currentColor" />

                    <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                    <rect x="5" y="80" width="15" height="15" fill="white" />
                    <rect x="10" y="85" width="5" height="5" fill="currentColor" />

                    {/* Random blocks to simulate QR */}
                    <rect x="35" y="5" width="10" height="5" fill="currentColor" />
                    <rect x="40" y="15" width="5" height="10" fill="currentColor" />
                    <rect x="30" y="30" width="15" height="5" fill="currentColor" />
                    <rect x="5" y="40" width="10" height="10" fill="currentColor" />
                    <rect x="15" y="60" width="5" height="5" fill="currentColor" />
                    
                    <rect x="55" y="25" width="10" height="5" fill="currentColor" />
                    <rect x="65" y="35" width="15" height="5" fill="currentColor" />
                    <rect x="50" y="45" width="15" height="15" fill="currentColor" />
                    
                    <rect x="35" y="75" width="10" height="10" fill="currentColor" />
                    <rect x="60" y="70" width="5" height="15" fill="currentColor" />
                    <rect x="70" y="85" width="15" height="5" fill="currentColor" />
                  </svg>
                </div>

                <div className="bg-surface-container-low p-4 border border-outline-variant/30 rounded text-center text-xs space-y-1.5 font-label">
                  <p className="text-on-surface-variant">ORDER ID: <span className="text-on-surface font-bold">#KM-{Math.floor(100000 + Math.random() * 900000)}</span></p>
                  <p className="text-on-surface-variant">COLLECTION GATE: <span className="text-on-surface font-bold">{itinerary?.gate}</span></p>
                  <p className="text-on-surface-variant">COUNTER: <span className="text-on-surface font-bold">Express Counter 3 (Concourse Level)</span></p>
                </div>

                <button 
                  onClick={() => setShowPreOrderModal(false)}
                  className="w-full bg-on-surface text-surface py-3 rounded font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors cursor-pointer text-center"
                >
                  DONE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to format Markdown bolding, lists, headers and newlines into HTML tags
function formatBoldText(str) {
  if (!str) return "";
  let html = str;
  // Replace headers (###, ##, #)
  html = html.replace(/^### (.*?)$/gm, "<h4 class='font-headline text-base font-bold mt-4 mb-2 text-primary uppercase tracking-wider'>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3 class='font-headline text-lg font-bold mt-6 mb-3 border-b border-outline-variant pb-1 text-on-surface uppercase tracking-tight'>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2 class='font-display text-2xl font-bold mt-8 mb-4 text-primary border-b-2 border-primary/20 pb-2 uppercase'>$1</h2>");
  // Replace horizontal rule
  html = html.replace(/^---$/gm, "<hr class='border-outline-variant my-6' />");
  // Replace bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Replace bullet lists
  html = html.replace(/^\- (.*?)$/gm, "<li class='ml-6 list-disc mb-1.5 text-on-surface-variant'>$1</li>");
  // Replace newlines with breaks
  html = html.replace(/\n/g, "<br />");
  return html;
}
